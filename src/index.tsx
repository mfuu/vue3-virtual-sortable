import Sortable from 'sortable-dnd';
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
  CoreService,
  getDataKey,
  isEqual,
  throttle,
  SortableAttrs,
  VirtualAttrs,
  type CoreOptions,
  type DragEvent,
  type DropEvent,
  type Range,
  type ScrollEvent,
} from './core';
import { KeyValueType, VirtualListProps } from './props';
import Item from './item';

const getList = (source: Ref<any[]> | any[]) => {
  return isRef(source) ? source.value : source;
};

const VirtualList = defineComponent({
  props: VirtualListProps,
  emits: ['update:modelValue', 'top', 'bottom', 'scroll', 'drag', 'drop', 'rangeChange'],
  setup(props, { emit, slots, expose }) {
    const list = ref<any[]>([]);
    const range = ref<Range>({ start: 0, end: props.keeps - 1, front: 0, behind: 0 });
    const dragging = ref<KeyValueType>('');
    const horizontal = computed(() => props.direction !== 'vertical');

    const rootElRef = ref<HTMLElement>();
    const wrapElRef = ref<HTMLElement>();

    function getSize(key: KeyValueType) {
      return core.virtual.getSize(key);
    }

    function getOffset() {
      return core.virtual.getOffset();
    }

    function getClientSize() {
      return core.virtual.getClientSize();
    }

    function getScrollSize() {
      return core.virtual.getScrollSize();
    }

    function scrollToKey(key: KeyValueType, align?: 'top' | 'bottom' | 'auto') {
      const index = uniqueKeys.indexOf(key);
      if (index > -1) {
        core.virtual.scrollToIndex(index, align);
      }
    }

    function scrollToOffset(offset: number) {
      core.virtual.scrollToOffset(offset);
    }

    function scrollToIndex(index: number, align?: 'top' | 'bottom' | 'auto') {
      core.virtual.scrollToIndex(index, align);
    }

    function scrollToTop() {
      scrollToOffset(0);
    }

    function scrollToBottom() {
      core.virtual.scrollToBottom();
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
      scrollToOffset(core.virtual.offset);

      core.virtual.addScrollEventListener();
    });

    onDeactivated(() => {
      core.virtual.removeScrollEventListener();
    });

    onMounted(() => {
      initCoreService();
    });

    onUnmounted(() => {
      core.destroy();
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

    const getItemKey = (item: any) => {
      if (typeof props.dataKey === 'function') {
        return props.dataKey(item);
      }

      return getDataKey(item, props.dataKey);
    };

    const updateUniqueKeys = () => {
      const len = list.value.length;
      const keys = new Array(len);

      for (let i = 0; i < len; i++) {
        keys[i] = getItemKey(list.value[i]);
      }

      uniqueKeys = keys;
      core?.option('uniqueKeys', uniqueKeys);
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
        core?.virtual.isReachedBottom()
      ) {
        newRange.start++;
      }

      core?.virtual.updateRange(newRange);
    };

    // ========================================== virtual sortable ==========================================
    let core: CoreService<KeyValueType>;

    const coreAttributes = computed(() => {
      return [...VirtualAttrs, ...SortableAttrs].reduce((res, key) => {
        res[key] = props[key];
        return res;
      }, {} as CoreOptions<KeyValueType>);
    });

    watch(
      () => [coreAttributes],
      (newVal, oldVal) => {
        if (!core) return;

        for (let key in newVal) {
          if (newVal[key] !== oldVal[key]) {
            core.option(key as any, newVal[key]);
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
      emit('scroll', event);

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
      if (isEqual(key, dragging.value) || !core) {
        return;
      }

      const sizes = core.virtual.sizes.size;
      core.virtual.updateItemSize(key, size);

      if (sizes === props.keeps - 1 && list.value.length > props.keeps) {
        core.virtual.updateRange(range.value);
      }
    };

    const onDrag = (event: DragEvent<KeyValueType>) => {
      const { key, index } = event;
      const item = list.value[index];

      Sortable.store.draggingItem = item;
      dragging.value = key;

      emit('drag', { ...event, item });
    };

    const onDrop = (event: DropEvent<KeyValueType>) => {
      const item = Sortable.store.draggingItem;
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

      dragging.value = '';

      if (event.changed) {
        emit('update:modelValue', newList);
      }
      emit('drop', { ...event, item, list: newList, oldList });
    };

    const initCoreService = () => {
      core = new CoreService(rootElRef.value!, {
        ...coreAttributes.value,
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
        const item = list.value[index];
        if (item) {
          const key = getItemKey(item);
          const isDragging = isEqual(key, dragging.value);

          renders.push(
            slots.item
              ? h(
                  Item,
                  {
                    key: key,
                    style: isDragging && { display: 'none' },
                    itemKey: key,
                    horizontal: horizontal.value,
                    onResize: onItemResized,
                  },
                  {
                    default: () => slots.item?.({ item, index, key }),
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
