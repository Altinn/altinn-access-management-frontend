import { store } from './app/store';
import { cakeActions } from './features/cake/cakeSlice';

console.log('Initial state', store.getState());
const unsubscribe = store.subscribe(() => {
  console.log('Updated state ', store.getState());
});

store.dispatch(cakeActions.ordered());
store.dispatch(cakeActions.ordered());
store.dispatch(cakeActions.ordered());
store.dispatch(cakeActions.restocked(3));

unsubscribe();
