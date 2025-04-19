const getWorker = () => {
  return new Worker(
      new URL('./worker-bg.js', import.meta.url), { type: 'module' }
  );
}

export async function ps_2_pdf( data){
  const worker = getWorker();
  worker.postMessage({ data: data, target: 'wasm'});
  return new Promise((resolve)=> {
    const listener = (e) => {
      resolve(e.data)
      worker.removeEventListener('message', listener)
      setTimeout(()=> worker.terminate(), 0);
    }
    worker.addEventListener('message', listener);
  })
}


