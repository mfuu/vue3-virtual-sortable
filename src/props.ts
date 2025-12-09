import { Direction } from 'sortable-dnd';
import { PropType } from 'vue';

export type LockAxis = 'x' | 'y';
export type KeyValueType = string | number;

export const VirtualProps = {
  modelValue: {
    type: Array as PropType<any[]>,
    default: () => [],
    required: true,
  },
  dataKey: {
    type: String,
    default: '',
    required: true,
  },
  tableMode: {
    type: Boolean,
    default: false,
  },
  draggable: {
    type: String,
    default: '[role="item"]',
  },
  sortable: {
    type: Boolean,
    default: true,
  },
  handle: {
    type: [Function, String],
    default: undefined,
  },
  group: {
    type: [Object, String],
    default: undefined,
  },
  scroller: {
    type: [Document, HTMLElement],
    default: undefined,
  },
  lockAxis: {
    type: String as PropType<LockAxis>,
    default: '',
  },
  direction: {
    type: String as PropType<Direction>,
    default: 'vertical',
  },
  keeps: {
    type: Number,
    default: 30,
  },
  size: {
    type: Number,
    default: undefined,
  },
  debounceTime: {
    type: Number,
    default: 0,
  },
  throttleTime: {
    type: Number,
    default: 0,
  },
  animation: {
    type: Number,
    default: 150,
  },
  autoScroll: {
    type: Boolean,
    default: true,
  },
  scrollSpeed: {
    type: Object,
    default: () => ({ x: 10, y: 10 }),
  },
  scrollThreshold: {
    type: Number,
    default: 55,
  },
  keepOffset: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  appendToBody: {
    type: Boolean,
    default: false,
  },
  delay: {
    type: Number,
    default: 0,
  },
  delayOnTouchOnly: {
    type: Boolean,
    default: false,
  },
  dropOnAnimationEnd: {
    type: Boolean,
    default: true,
  },
  rootTag: {
    type: String,
    default: 'div',
  },
  wrapTag: {
    type: String,
    default: 'div',
  },
  wrapClass: {
    type: String,
    default: '',
  },
  wrapStyle: {
    type: Object,
    default: () => ({}),
  },
  ghostClass: {
    type: String,
    default: '',
  },
  ghostStyle: {
    type: Object,
    default: () => ({}),
  },
  chosenClass: {
    type: String,
    default: '',
  },
  placeholderClass: {
    type: String,
    default: '',
  },
};

export const ItemProps = {
  dataKey: {
    type: [String, Number],
    default: undefined,
  },
  horizontal: {
    type: Boolean,
    default: false,
  },
};
