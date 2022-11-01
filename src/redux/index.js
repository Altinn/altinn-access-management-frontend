import { reduxLogger } from 'redux-logger';
import { produce } from 'immer';
import { redux } from 'redux';
const createStore = redux.createStore;
const bindActionCreators = redux.bindActionCreators;
const combineReducers = redux.combineReducers;

const applyMiddleWare = redux.applyMiddleware;
const logger = reduxLogger.createLogger();

// action
const CAKE_ORDERED = 'CAKE_ORDERED';
const CAKE_RESTOCKED = 'CAKE_RESTOCKED';

const ICECREAM_ORDERED = 'ICECREAM_ORDERED';
const ICECREAM_RESTOCKED = 'ICECREAM_ORDERED';

// define actionCreator
function orderCake() {
  // define actions
  return {
    type: CAKE_ORDERED,
    quantity: 1,
  };
}

function restockCake(qty = 1) {
  return {
    type: CAKE_RESTOCKED,
    payload: qty,
  };
}

function orderIceCream() {
  // define actions
  return {
    type: ICECREAM_ORDERED,
    quantity: 1,
  };
}

function restockIceCream(qty = 1) {
  return {
    type: ICECREAM_ORDERED,
    payload: qty,
  };
}

// declare initialState
/* const initialState = {
  numOfCakes: 10,
  numOfIceCreams: 20,
}; */

const initialCakeState = {
  numOfCakes: 10,
};

const initialIceCreamState = {
  numOfIceCreams: 20,
};

// (previousState, action) => newState
// declare reducer
const cakeReducer = (state = initialCakeState, action) => {
  switch (action.type) {
    case CAKE_ORDERED:
      return {
        ...state,
        numOfCakes: state.numOfCakes - 1,
      };
    case CAKE_RESTOCKED:
      return {
        ...state,
        numOfCakes: state.numOfCakes + action.payload,
      };
    default:
      return state;
  }
};

const iceCreamReducer = (state = initialIceCreamState, action) => {
  switch (action.type) {
    case ICECREAM_ORDERED:
      return {
        ...state,
        numOfIceCreams: state.numOfIceCreams - 1,
      };
    case ICECREAM_RESTOCKED:
      return {
        ...state,
        numOfIceCreams: state.numOfIceCreams + action.payload,
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  cake: cakeReducer,
  iceCream: iceCreamReducer,
});

// creating store
const store = createStore(rootReducer, applyMiddleWare(logger));

// subscribe
const unsubscribe = store.subscribe(() => console.log('Update state', store.getState()));

// Does the action
// store.dispatch(orderCake());
// store.dispatch(orderCake());
// store.dispatch(orderCake());
// store.dispatch(restockCake(3));

const actions = bindActionCreators({ orderCake, restockCake, orderIceCream, restockIceCream }, store.dispatch);
actions.orderCake();
actions.orderCake();
actions.orderCake();
actions.restockCake(3);
actions.orderIceCream();
actions.orderIceCream();
actions.restockIceCream(2);
// Unsubscribe to the changes
unsubscribe();

console.log('Initial state', store.getState());
