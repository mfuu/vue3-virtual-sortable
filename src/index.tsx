import {
  h,
  ref,
  isRef,
  watch,
  computed,
  onMounted,
  onActivated,
  onUnmounted,
  onDeactivated,
  onBeforeMount,
  defineComponent,
} from 'vue';
import { SortableEvent } from 'sortable-dnd';
import {
  Range,
  Virtual,
  Sortable,
  throttle,
  DropEvent,
  DragEvent,
  getDataKey,
  ScrollEvent,
  VirtualAttrs,
  SortableAttrs,
  VirtualOptions,
  SortableOptions,
  isSameValue,
} from './core';
import { VirtualProps } from './props';
import Item from './item';

const getList = (source) => {
  return isRef(source) ? source.value : source;
};

const VirtualList = defineComponent({
  props: VirtualProps,
  emits: ['update:modelValue', 'top', 'bottom', 'drag', 'drop', 'rangeChange'],
  setup(props, { emit, slots, expose }) {
    const list = ref([]);
    const range = ref<Range>({ start: 0, end: props.keeps - 1, front: 0, behind: 0 });
    const horizontal = computed(() => props.direction !== 'vertical');

    const rootRef = ref<HTMLElement>();
    const wrapRef = ref<HTMLElement>();

    function getSize(key: string | number) {
      return virtual.getSize(key);
    }

    function getOffset() {
      return virtual.getOffset();
    }

    function getClientSize() {
      return virtual.getClientSize();
    }

    function getScrollSize() {
      return virtual.getScrollSize();
    }

    function scrollToKey(key: string | number) {
      const index = uniqueKeys.indexOf(key);
      if (index > -1) {
        virtual.scrollToIndex(index);
      }
    }

    function scrollToOffset(offset: number) {
      virtual.scrollToOffset(offset);
    }

    function scrollToIndex(index: number) {
      virtual.scrollToIndex(index);
    }

    function scrollToTop() {
      scrollToOffset(0);
    }

    function scrollToBottom() {
      virtual.scrollToBottom();
    }

    expose({
      getSize,
      getOffset,
      getClientSize,
      getScrollSize,
      scrollToTop,
      scrollToBottom,
      scrollToKey,
      scrollToIndex,
      scrollToOffset,
    });

    // ========================================== model change ==========================================
    watch(
      () => [props.modelValue],
      () => {
        onModelUpdate();
      },
      {
        deep: true,
      }
    );

    onBeforeMount(() => {
      onModelUpdate();
    });

    // set back offset when awake from keep-alive
    onActivated(() => {
      virtual && scrollToOffset(virtual.offset);

      virtual.addScrollEventListener();
    });

    onDeactivated(() => {
      virtual.removeScrollEventListener();
    });

    onMounted(() => {
      installVirtual();
      installSortable();
    });

    onUnmounted(() => {
      sortable?.destroy();
      virtual?.removeScrollEventListener();
    });

    let lastList: any[] = [];
    let uniqueKeys: (string | number)[] = [];
    let topLoadLength: number = 0;
    const onModelUpdate = () => {
      const data = getList(props.modelValue);
      if (!data) return;

      list.value = data;
      updateUniqueKeys();
      updateRange(lastList, data);

      sortable?.option('list', data);

      // if auto scroll to the last offset
      if (topLoadLength && props.keepOffset) {
        const index = data.length - topLoadLength;
        if (index > 0) {
          scrollToIndex(index);
        }
        topLoadLength = 0;
      }

      lastList = [...list.value];
    };

    const updateUniqueKeys = () => {
      uniqueKeys = list.value.map((item) => getDataKey(item, props.dataKey));
      virtual?.option('uniqueKeys', uniqueKeys);
      sortable?.option('uniqueKeys', uniqueKeys);
    };

    const updateRange = (oldList, newList) => {
      if (!oldList.length && !newList.length) {
        return;
      }

      if (oldList.length === newList.length) {
        return;
      }

      let newRange = { ...range.value };
      if (
        oldList.length > props.keeps &&
        newList.length > oldList.length &&
        newRange.end === oldList.length - 1 &&
        scrolledToBottom()
      ) {
        newRange.start++;
      }
      virtual?.updateRange(newRange);
    };

    const scrolledToBottom = () => {
      const offset = getOffset();
      const clientSize = getClientSize();
      const scrollSize = getScrollSize();
      return offset + clientSize + 1 >= scrollSize;
    };

    // ========================================== use virtual ==========================================
    let virtual: Virtual;
    const dragging = ref<boolean>(false);
    const chosenKey = ref<string>('');
    const virtualAttributes = computed(() => {
      return VirtualAttrs.reduce((res, key) => {
        res[key] = props[key];
        return res;
      }, {});
    });

    watch(virtualAttributes, (newVal, oldVal) => {
      if (!virtual) return;
      for (let key in newVal) {
        if (newVal[key] !== oldVal[key]) {
          virtual.option(key as keyof VirtualOptions, newVal[key]);
        }
      }
    });

    const handleToTop = throttle(() => {
      topLoadLength = list.value.length;
      emit('top');
    }, 50);

    const handleToBottom = throttle(() => {
      emit('bottom');
    }, 50);

    const onScroll = (event: ScrollEvent) => {
      topLoadLength = 0;
      if (!!list.value.length && event.top) {
        handleToTop();
      } else if (event.bottom) {
        handleToBottom();
      }
    };

    const onUpdate = (newRange: Range) => {
      const rangeChanged = newRange.start !== range.value.start;
      if (dragging.value && rangeChanged && sortable) {
        sortable.rangeChanged = true;
      }
      range.value = newRange;
      rangeChanged && emit('rangeChange', newRange);
    };

    const installVirtual = () => {
      virtual = new Virtual({
        ...virtualAttributes.value,
        buffer: Math.round(props.keeps / 3),
        wrapper: wrapRef.value!,
        scroller: props.scroller || rootRef.value,
        uniqueKeys: uniqueKeys,
        onScroll,
        onUpdate,
      });
    };

    const onItemResized = (size: number, key: string | number) => {
      // ignore changes for dragging element
      if (isSameValue(key, chosenKey.value)) {
        return;
      }

      const sizes = virtual.sizes.size;
      virtual.onItemResized(key, size);

      if (sizes === props.keeps - 1 && list.value.length > props.keeps) {
        virtual.updateRange(range.value);
      }
    };

    // ========================================== use sortable ==========================================
    let sortable: Sortable<any>;
    const sortableAttributes = computed(() => {
      return SortableAttrs.reduce((res, key) => {
        res[key] = props[key];
        return res;
      }, {});
    });

    watch(sortableAttributes, (newVal, oldVal) => {
      if (!sortable) return;
      for (let key in newVal) {
        if (newVal[key] !== oldVal[key]) {
          sortable.option(key as keyof SortableOptions<any>, newVal[key]);
        }
      }
    });

    const onChoose = (event: SortableEvent) => {
      chosenKey.value = event.node.getAttribute('data-key') as string;
    };

    const onUnchoose = () => {
      chosenKey.value = '';
    };

    const onDrag = (event: DragEvent<any>) => {
      dragging.value = true;
      if (!props.sortable) {
        virtual.enableScroll(false);
        sortable.option('autoScroll', false);
      }
      emit('drag', event);
    };

    const onDrop = (event: DropEvent<any>) => {
      dragging.value = false;

      virtual.enableScroll(true);
      sortable.option('autoScroll', props.autoScroll);

      if (event.changed) {
        emit('update:modelValue', event.list);
      }
      emit('drop', event);
    };

    const installSortable = () => {
      sortable = new Sortable(rootRef.value!, {
        ...sortableAttributes.value,
        list: list.value,
        uniqueKeys: uniqueKeys,
        onDrag,
        onDrop,
        onChoose,
        onUnchoose,
      });
    };

    // ========================================== layout ==========================================
    const renderSpacer = (offset) => {
      const offsetKey = horizontal.value ? 'width' : 'height';
      if (props.tableMode) {
        const tdStyle = { padding: 0, border: 0, [offsetKey]: `${offset}px` };

        return h('tr', {}, [h('td', { style: tdStyle })]);
      }

      return null;
    };

    const renderItems = () => {
      const renders: any[] = [];
      const { start, end, front, behind } = range.value;
      const sizeKey = horizontal.value ? 'offsetWidth' : 'offsetHeight';

      renders.push(renderSpacer(front));

      for (let index = start; index <= end; index++) {
        const record = list.value[index];
        if (record) {
          const dataKey = getDataKey(record, props.dataKey);
          const isChosen = isSameValue(dataKey, chosenKey.value);
          renders.push(
            slots.item
              ? h(
                  Item,
                  {
                    key: dataKey,
                    style: dragging.value && isChosen && { display: 'none' },
                    dataKey: dataKey,
                    sizeKey: sizeKey,
                    onResize: onItemResized,
                  },
                  {
                    default: () => slots.item?.({ record, index, dataKey }),
                  }
                )
              : null
          );
        }
      }

      renders.push(renderSpacer(behind));

      return renders;
    };

    return () => {
      const { front, behind } = range.value;
      const { tableMode, rootTag, wrapTag, scroller, wrapClass, wrapStyle } = props;

      const overflow = horizontal.value ? 'auto hidden' : 'hidden auto';
      const padding = horizontal.value ? `0 ${behind}px 0 ${front}px` : `${front}px 0 ${behind}px`;

      const containerTag = tableMode ? 'table' : rootTag;
      const wrapperTag = tableMode ? 'tbody' : wrapTag;

      return h(
        containerTag,
        {
          ref: rootRef,
          style: !scroller && !tableMode && { overflow },
        },
        {
          default: () => [
            slots.header?.(),
            h(
              wrapperTag,
              {
                ref: wrapRef,
                class: wrapClass,
                style: { ...wrapStyle, padding: !tableMode && padding },
              },
              {
                default: () => renderItems(),
              }
            ),
            slots.footer?.(),
          ],
        }
      );
    };
  },
});

export default VirtualList;
