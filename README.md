# vue-virtual-sortable

[![npm](https://img.shields.io/npm/v/vue-virtual-sortable/next.svg)](https://www.npmjs.com/package/vue-virtual-sortable) [![npm](https://img.shields.io/npm/dm/vue-virtual-sortable.svg)](https://www.npmjs.com/package/vue-virtual-sortable) [![vue2](https://img.shields.io/badge/vue-3.x-brightgreen.svg)](https://vuejs.org/) [![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)

A virtual scrolling list component that can be sorted by dragging, support vue3

If you use vue with 2.x, see [here](https://github.com/mfuu/vue-virtual-sortable)

### [Live demo](https://mfuu.github.io/vue3-virtual-sortable/)

## Simple usage

```bash
npm i vue-virtual-sortable@next
```

Root component:

```vue
<template>
  <div>
    <!--
      :handle="'i'" // use tagName 
      :handle="'.handle'" // use class
      :handle="'#handle'" // use id
    -->
    <virtual-list v-model="list" dataKey="id" handle="#handle" style="height: 500px;">
      <template v-slot:item="{ record, index, dataKey }">
        <div>
          <i id="handle" class="handle">handle</i>
          <p>{{ record.text }}</p>
        </div>
      </template>
      <template v-slot:header>
        <div class="header">header</div>
      </template>
      <template v-slot:footer>
        <div class="footer">footer</div>
      </template>
    </virtual-list>
  </div>
</template>

<script setup lang="ts">
import VirtualList from 'vue-virtual-sortable';

const list = ref([
  { id: '1', text: 'abc' },
  { id: '2', text: 'def' },
]);
// const items = computed({
//   get() {
//     return list.value;
//   },
//   set(val) {
//     list.value = val;
//     console.log(val);
//   }
// })
</script>
```

## Emits

| **Emit**      | **Description**                      |
| ------------- | ------------------------------------ |
| `top`         | Scrolled to top of scroll element    |
| `bottom`      | Scrolled to bottom of scroll element |
| `drag`        | Element dragging started             |
| `drop`        | Element dragging is completed        |
| `rangeChange` | List rendering range changed         |

## Props

### Required props

| **Prop**   | **Type** | **Description**                                                       |
| ---------- | -------- | --------------------------------------------------------------------- |
| `v-model`  | `Array`  | The data that needs to be rendered                                    |
| `data-key` | `String` | The unique identifier of each piece of data, in the form of `'a.b.c'` |

### Optional props

**Commonly used**

| **Prop**       | **Type**                  | **Default** | **Description**                                                                 |
| -------------- | ------------------------- | ----------- | ------------------------------------------------------------------------------- |
| `keeps`        | `Number`                  | `30`        | The number of lines rendered by the virtual scroll                              |
| `size`         | `Number`                  | `-`         | The estimated height of each piece of data, it will be automatically calculated |
| `handle`       | `Function/String`         | `-`         | Drag handle selector within list items                                          |
| `group`        | `Object/String`           | `-`         | Set value to allow drag between different lists                                 |
| `direction`    | `vertical \| horizontal`  | `vertical`  | Scroll direction                                                                |
| `scroller`     | `Document \| HTMLElement` | `-`         | Virtual list scrolling element                                                  |
| `lockAxis`     | `x \| y`                  | `-`         | Axis on which dragging will be locked                                           |
| `tableMode`    | `Boolean`                 | `false`     | Display with table and tbody                                                    |
| `keepOffset`   | `Boolean`                 | `false`     | When scrolling up to load data, keep the same offset as the previous scroll     |
| `debounceTime` | `Number`                  | `0`         | Scroll debounce time                                                            |
| `throttleTime` | `Number`                  | `0`         | Scroll throttle time                                                            |

**Uncommonly used**

| **Prop**             | **Type**  | **Default**        | **Description**                                               |
| -------------------- | --------- | ------------------ | ------------------------------------------------------------- |
| `disabled`           | `Boolean` | `false`            | Disables the sortable if set to true                          |
| `sortable`           | `Boolean` | `true`             | Whether the current list can be sorted by dragging            |
| `draggable`          | `String`  | `[role="item"]`    | Specifies which items inside the element should be draggable. |
| `animation`          | `Number`  | `150`              | Animation speed moving items when sorting                     |
| `autoScroll`         | `Boolean` | `true`             | Automatic scrolling when moving to the edge of the container  |
| `scrollSpeed`        | `Object`  | `{ x: 10, y: 10 }` | Vertical&Horizontal scrolling speed (px)                      |
| `scrollThreshold`    | `Number`  | `55`               | Threshold to trigger autoscroll                               |
| `delay`              | `Number`  | `0`                | Time in milliseconds to define when the sorting should start  |
| `delayOnTouchOnly`   | `Boolean` | `false`            | Only delay on press if user is using touch                    |
| `appendToBody`       | `Boolean` | `false`            | Appends the ghost element into the document's body            |
| `dropOnAnimationEnd` | `Boolean` | `true`             | Whether to trigger the drop event when the animation ends     |
| `rootTag`            | `String`  | `div`              | Label type for root element                                   |
| `wrapTag`            | `String`  | `div`              | Label type for list wrap element                              |
| `wrapClass`          | `String`  | `''`               | Class name for list wrap element                              |
| `wrapStyle`          | `Object`  | `{}`               | Style object for list wrap element                            |
| `ghostClass`         | `String`  | `''`               | Class name for the mask element when dragging                 |
| `ghostStyle`         | `Object`  | `{}`               | Style object for the mask element when dragging               |
| `chosenClass`        | `String`  | `''`               | Class name for the chosen item                                |
| `placeholderClass`   | `String`  | `''`               | Class name for the drop placeholder                           |

## Methods

| **Method**                    | **Description**                                            |
| ----------------------------- | ---------------------------------------------------------- |
| `getSize(key)`                | Get the size of the current item by unique key value       |
| `getOffset()`                 | Get the current scroll height                              |
| `getClientSize()`             | Get wrapper element client viewport size (width or height) |
| `getScrollSize()`             | Get all scroll size (scrollHeight or scrollWidth)          |
| `scrollToTop()`               | Scroll to top of list                                      |
| `scrollToBottom()`            | Scroll to bottom of list                                   |
| `scrollToKey(key, align)`     | Scroll to the specified data-key position                  |
| `scrollToIndex(index, align)` | Scroll to the specified index position                     |
| `scrollToOffset(offset)`      | Scroll to the specified offset                             |
