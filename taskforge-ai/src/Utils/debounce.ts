export function debounce<T extends (...args:any[])=>void>
(fn: T,wait = 300){
   let timer :ReturnType <typeof setTimeout> | null =null;
   return function(this:any,...args:Parameters<T>){
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, wait);
   }as T;
}


export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  interval = 1000,
  { leading = true, trailing = true } = {}
) {
  let lastCall = 0;
  let trailingTimer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any;
  const invoke = () => {
    lastCall = Date.now();
    fn.apply(lastThis, lastArgs as Parameters<T>);
    lastArgs = null;
  };
  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = interval - (now - lastCall);
    lastArgs = args;
    lastThis = this;

    if (remaining <= 0) {
      if (leading || lastCall !== 0) invoke();
      else lastCall = now; 
      if (trailingTimer) {
        clearTimeout(trailingTimer);
        trailingTimer = null;
      }
    } else if (trailing && !trailingTimer) {
      trailingTimer = setTimeout(() => {
        trailingTimer = null;
        if (!leading) lastCall = 0; 
        if (lastArgs) invoke();
      }, remaining);
    }
  } as T;
}