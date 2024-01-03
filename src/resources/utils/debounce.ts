// Delays calling of func by timeout ms
export function debounce(func: (...args: any[]) => void, timeout = 300) {
  console.log('ready to bounce');
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    console.log('time is out!');
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}
