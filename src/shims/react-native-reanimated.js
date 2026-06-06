const React = require("react");
const { Animated } = require("react-native");

function identity(value) {
  return value;
}

function makeMutable(value) {
  return { value };
}

function useAnimatedStyle(factory) {
  return typeof factory === "function" ? factory() : {};
}

const Easing = {
  linear: identity,
  ease: identity,
  quad: identity,
  cubic: identity,
  bezier: () => identity,
  in: () => identity,
  out: () => identity,
  inOut: () => identity,
};

module.exports = {
  __esModule: true,
  default: Animated,
  Animated,
  Easing,
  makeMutable,
  useAnimatedStyle,
  useSharedValue: makeMutable,
  useDerivedValue: (factory) => makeMutable(typeof factory === "function" ? factory() : undefined),
  useAnimatedReaction: () => {},
  useAnimatedRef: () => React.useRef(null),
  withTiming: identity,
  withDelay: (_delay, value) => value,
  withRepeat: identity,
  withSequence: (...values) => values[values.length - 1],
  cancelAnimation: () => {},
  runOnJS: (fn) => fn,
  interpolate: identity,
};
