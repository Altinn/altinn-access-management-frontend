import { store } from './app/store';

console.log('Initial state', store.getState());
const unsubscribe = store.subscribe(() => {
  console.log('Updated state ', store.getState());
});

unsubscribe();
