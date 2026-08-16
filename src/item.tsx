import { h, defineComponent } from 'vue';
import { ListItemProps } from './props';

type CallFun = (vnodeEl: HTMLElement) => void;
type Funs = Record<'mounted' | 'updated' | 'unmounted', CallFun>;
const createSlot = ({ mounted, updated, unmounted }: Funs) => {
  return defineComponent({
    props: ['vnode'],
    mounted() {
      mounted(this.$el);
    },
    onUpdated() {
      updated(this.$el);
    },
    onUnmounted() {
      unmounted(this.$el);
    },
    render(props) {
      return props.vnode;
    },
  });
};

const Item = defineComponent({
  props: ListItemProps,
  emits: ['resize'],
  setup(props, { emit, slots }) {
    let observer: ResizeObserver | null = null;

    const onSizeChange = (el: HTMLElement) => {
      const sizeKey = props.horizontal ? 'offsetWidth' : 'offsetHeight';
      const size = el ? el[sizeKey] : 0;
      emit('resize', size, props.itemKey);
    };

    const mounted = (el: HTMLElement) => {
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(() => {
          onSizeChange(el);
        });
        el && observer.observe(el);
      }
    };

    const updated = (el: HTMLElement) => {
      onSizeChange(el);
    };

    const unmounted = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    };

    const customSlot = createSlot({ mounted, updated, unmounted });

    return () => {
      const { itemKey } = props;
      const [defaultSlot] = slots.default?.() || [];
      return h(
        customSlot,
        {
          key: itemKey,
          role: 'item',
          vnode: defaultSlot,
          'data-key': itemKey,
        },
        { default: () => slots.default?.() }
      );
    };
  },
});

export default Item;
