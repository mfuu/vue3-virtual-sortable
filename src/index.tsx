import {
  h,
  ref,
  Ref,
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
import {
  getDataKey,
  isEqual,
  throttle,
  SortableAttrs,
  VirtualAttrs,
  VirtualSortable,
  type DragEvent,
  type DropEvent,
  type Options,
  type Range,
  type ScrollEvent,
} from './core';
import { KeyValueType, VirtualProps } from './props';
import Item from './item';

let draggingItem: any;

const getList = (source: Ref<any[]> | any[]) => {
  return isRef(source) ? source.value : source;
};

const VirtualList = defineComponent({
  props: VirtualProps,
  emits: ['update:modelValue', 'top', 'bottom', 'drag', 'drop', 'rangeChange'],
  setup(props, { emit, slots, expose }) {
    const list = ref<any[]>([]);
    const range = ref<Range>({ start: 0, end: props.keeps - 1, front: 0, behind: 0 });
    const dragging = ref<KeyValueType>('');
    const horizontal = computed(() => props.direction !== 'vertical');

    const rootElRef = ref<HTMLElement>();
    const wrapElRef = ref<HTMLElement>();

    function getSize(key: KeyValueType) {
      return VS.call('getSize', key);
    }

    function getOffset() {
      return VS.call('getOffset');
    }

    function getClientSize() {
      return VS.call('getClientSize');
    }

    function getScrollSize() {
      return VS.call('getScrollSize');
    }

    function scrollToKey(key: KeyValueType, align?: 'top' | 'bottom' | 'auto') {
      const index = uniqueKeys.indexOf(key);
      if (index > -1) {
        VS.call('scrollToIndex', index, align);
      }
    }

    function scrollToOffset(offset: number) {
      VS.call('scrollToOffset', offset);
    }

    function scrollToIndex(index: number, align?: 'top' | 'bottom' | 'auto') {
      VS.call('scrollToIndex', index, align);
    }

    function scrollToTop() {
      scrollToOffset(0);
    }

    function scrollToBottom() {
      VS.call('scrollToBottom');
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
      scrollToOffset(VS.virtual.offset);

      VS.call('addScrollEventListener');
    });

    onDeactivated(() => {
      VS.call('removeScrollEventListener');
    });

    onMounted(() => {
      initVirtualSortable();
    });

    onUnmounted(() => {
      VS.destroy();
    });

    let uniqueKeys: KeyValueType[] = [];
    let lastListLength: number = 0;
    let listLengthWhenTopLoading: number = 0;
    const onModelUpdate = () => {
      const data = getList(props.modelValue);
      if (!data) return;

      list.value = data;
      updateUniqueKeys();
      detectRangeChange(lastListLength, data.length);

      // if auto scroll to the last offset
      if (listLengthWhenTopLoading && props.keepOffset) {
        const index = data.length - listLengthWhenTopLoading;
        if (index > 0) {
          scrollToIndex(index);
        }
        listLengthWhenTopLoading = 0;
      }

      lastListLength = data.length;
    };

    const updateUniqueKeys = () => {
      uniqueKeys = list.value.map((item) => getDataKey(item, props.dataKey));
      VS?.option('uniqueKeys', uniqueKeys);
    };

    const detectRangeChange = (oldListLength: number, newListLength: number) => {
      if (!oldListLength && !newListLength) {
        return;
      }

      if (oldListLength === newListLength) {
        return;
      }

      let newRange = { ...range.value };
      if (
        oldListLength > props.keeps &&
        newListLength > oldListLength &&
        newRange.end === oldListLength - 1 &&
        VS?.call('isReachedBottom')
      ) {
        newRange.start++;
      }

      VS?.call('updateRange', newRange);
    };

    // ========================================== virtual sortable ==========================================
    let VS: VirtualSortable<KeyValueType>;

    const vsAttributes = computed(() => {
      return [...VirtualAttrs, ...SortableAttrs].reduce((res, key) => {
        res[key] = props[key];
        return res;
      }, {});
    });

    watch(
      () => [vsAttributes],
      (newVal, oldVal) => {
        if (!VS) return;

        for (let key in newVal) {
          if (newVal[key] !== oldVal[key]) {
            VS.option(key as keyof Options<KeyValueType>, newVal[key]);
          }
        }
      }
    );

    const handleToTop = throttle(() => {
      listLengthWhenTopLoading = list.value.length;
      emit('top');
    }, 50);

    const handleToBottom = throttle(() => {
      emit('bottom');
    }, 50);

    const onScroll = (event: ScrollEvent) => {
      listLengthWhenTopLoading = 0;
      if (!!list.value.length && event.top) {
        handleToTop();
      } else if (event.bottom) {
        handleToBottom();
      }
    };

    const onUpdate = (newRange: Range, changed: boolean) => {
      range.value = newRange;

      changed && emit('rangeChange', newRange);
    };

    const onItemResized = (size: number, key: KeyValueType) => {
      // ignore changes for dragging element
      if (isEqual(key, dragging.value) || !VS) {
        return;
      }

      const sizes = VS.virtual.sizes.size;
      VS.call('updateItemSize', key, size);

      if (sizes === props.keeps - 1 && list.value.length > props.keeps) {
        VS.call('updateRange', range.value);
      }
    };

    const onDrag = (event: DragEvent<KeyValueType>) => {
      const { key, index } = event;
      const item = list.value[index];

      draggingItem = item;
      dragging.value = key;

      if (!props.sortable) {
        VS.call('enableScroll', false);
        VS.option('autoScroll', false);
      }

      emit('drag', { ...event, item });
    };

    const onDrop = (event: DropEvent<KeyValueType>) => {
      const item = draggingItem;
      const { oldIndex, newIndex } = event;

      const oldList = [...list.value];
      const newList = [...list.value];

      if (oldIndex === -1) {
        newList.splice(newIndex, 0, item);
      } else if (newIndex === -1) {
        newList.splice(oldIndex, 1);
      } else {
        newList.splice(oldIndex, 1);
        newList.splice(newIndex, 0, item);
      }

      VS.call('enableScroll', true);
      VS.option('autoScroll', props.autoScroll);

      dragging.value = '';

      if (event.changed) {
        emit('update:modelValue', newList);
      }
      emit('drop', { ...event, item, list: newList, oldList });
    };

    const initVirtualSortable = () => {
      VS = new VirtualSortable(rootElRef.value!, {
        ...vsAttributes.value,
        buffer: Math.round(props.keeps / 3),
        wrapper: wrapElRef.value!,
        scroller: props.scroller || rootElRef.value!,
        uniqueKeys: uniqueKeys,
        ghostContainer: wrapElRef.value,
        onDrag,
        onDrop,
        onScroll,
        onUpdate,
      });
    };

    // ========================================== layout ==========================================
    const renderSpacer = (offset: number) => {
      if (props.tableMode) {
        const offsetKey = horizontal.value ? 'width' : 'height';
        const tdStyle = { padding: 0, border: 0, [offsetKey]: `${offset}px` };

        return h('tr', {}, [h('td', { style: tdStyle })]);
      }

      return null;
    };

    const renderItems = () => {
      const renders: any[] = [];
      const { start, end, front, behind } = range.value;

      renders.push(renderSpacer(front));

      for (let index = start; index <= end; index++) {
        const record = list.value[index];
        if (record) {
          const dataKey = getDataKey(record, props.dataKey);
          const isDragging = isEqual(dataKey, dragging.value);

          renders.push(
            slots.item
              ? h(
                  Item,
                  {
                    key: dataKey,
                    style: isDragging && { display: 'none' },
                    dataKey: dataKey,
                    horizontal: horizontal.value,
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

      const rootElTag = tableMode ? 'table' : rootTag;
      const wrapElTag = tableMode ? 'tbody' : wrapTag;

      return h(
        rootElTag,
        {
          ref: rootElRef,
          style: !scroller && !tableMode && { overflow },
        },
        {
          default: () => [
            slots.header?.(),
            h(
              wrapElTag,
              {
                ref: wrapElRef,
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
