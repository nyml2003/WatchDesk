use napi::bindgen_prelude::*;
use napi::threadsafe_function::*;
use napi_derive::napi;
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use std::io::Read;
use std::sync::{Arc, Mutex};

type PtyHandle = u32;

struct PtyInstance {
    master: Box<dyn portable_pty::MasterPty + Send>,
    writer: Option<Box<dyn std::io::Write + Send>>,
    child: Option<Box<dyn portable_pty::Child + Send + Sync>>,
    reader_handle: Option<std::thread::JoinHandle<()>>,
}

static NEXT_ID: Mutex<u32> = Mutex::new(0);
static INSTANCES: Mutex<
    Option<std::collections::HashMap<PtyHandle, Arc<Mutex<PtyInstance>>>>,
> = Mutex::new(None);

fn next_id() -> PtyHandle {
    let mut id = NEXT_ID.lock().unwrap();
    *id += 1;
    *id
}

fn with_instance<F, R>(id: PtyHandle, f: F) -> Result<R>
where
    F: FnOnce(&mut PtyInstance) -> Result<R>,
{
    let map = INSTANCES.lock().unwrap();
    let instances = map.as_ref().ok_or_else(|| Error::from_reason("No PTY instances"))?;
    let arc = instances
        .get(&id)
        .ok_or_else(|| Error::from_reason("PTY instance not found"))?;
    let mut instance = arc.lock().unwrap();
    f(&mut instance)
}

#[napi]
pub fn pty_spawn(
    shell: Option<String>,
    cwd: Option<String>,
    cols: Option<u32>,
    rows: Option<u32>,
    #[napi(ts_arg_type = "(data: Buffer) => void")] on_data: ThreadsafeFunction<Vec<u8>, ErrorStrategy::CalleeHandled>,
) -> Result<PtyHandle> {
    let pty_system = native_pty_system();
    let pair = pty_system
        .openpty(PtySize {
            rows: rows.unwrap_or(24) as u16,
            cols: cols.unwrap_or(80) as u16,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| Error::from_reason(format!("openpty: {}", e)))?;

    let shell_program = shell.unwrap_or_else(|| {
        if cfg!(target_os = "windows") {
            "cmd.exe".to_string()
        } else {
            std::env::var("SHELL").unwrap_or_else(|_| "sh".to_string())
        }
    });

    let mut cmd = CommandBuilder::new(shell_program);
    if let Some(dir) = cwd {
        cmd.cwd(dir);
    }

    let child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| Error::from_reason(format!("spawn: {}", e)))?;

    let master = pair.master;
    let writer = master
        .take_writer()
        .map_err(|e| Error::from_reason(format!("take_writer: {}", e)))?;
    let mut reader = master
        .try_clone_reader()
        .map_err(|e| Error::from_reason(format!("clone reader: {}", e)))?;

    let reader_handle = std::thread::spawn(move || {
        let mut buf = [0u8; 4096];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => break,
                Ok(n) => {
                    let data = buf[..n].to_vec();
                    let status = on_data.call(Ok(data), ThreadsafeFunctionCallMode::NonBlocking);
                    if status != Status::Ok {
                        break;
                    }
                }
                Err(_) => break,
            }
        }
    });

    let id = next_id();
    let instance = PtyInstance {
        master,
        writer: Some(writer),
        child: Some(child),
        reader_handle: Some(reader_handle),
    };

    let mut map = INSTANCES.lock().unwrap();
    if map.is_none() {
        *map = Some(std::collections::HashMap::new());
    }
    map.as_mut().unwrap().insert(id, Arc::new(Mutex::new(instance)));

    Ok(id)
}

#[napi]
pub fn pty_write(id: PtyHandle, data: Buffer) -> Result<()> {
    with_instance(id, |instance| {
        let writer = instance
            .writer
            .as_mut()
            .ok_or_else(|| Error::from_reason("No writer"))?;
        writer
            .write_all(&data)
            .map_err(|e| Error::from_reason(format!("write: {}", e)))
    })
}

#[napi]
pub fn pty_resize(id: PtyHandle, cols: u32, rows: u32) -> Result<()> {
    with_instance(id, |instance| {
        instance
            .master
            .resize(PtySize {
                rows: rows as u16,
                cols: cols as u16,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| Error::from_reason(format!("resize: {}", e)))
    })
}

#[napi]
pub fn pty_kill(id: PtyHandle) -> Result<()> {
    let mut map = INSTANCES.lock().unwrap();
    if let Some(instances) = map.as_mut() {
        instances.remove(&id);
    }
    Ok(())
}
