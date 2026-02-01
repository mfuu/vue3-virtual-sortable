# Props

## `v-model`

| **Type** | **Default** | **Required** |
| -------- | ----------- | ------------ |
| `Array`  | `[]`        | `true`       |

The data that needs to be rendered

## `data-key`

| **Type** | **Default** | **Required** |
| -------- | ----------- | ------------ |
| `String` | `-`         | `true`       |

The unique identifier of each piece of data, in the form of `'a.b.c'`

## `keeps`

| **Type** | **Default** |
| -------- | ----------- |
| `Number` | `30`        |

The number of lines rendered by the virtual scroll

## `size`

| **Type** | **Default** |
| -------- | ----------- |
| `Number` | `0`         |

The estimated height of each piece of data, you can choose to pass it or not, it will be automatically calculated

## `buffer`

| **Type** | **Default**             |
| -------- | ----------------------- |
| `Number` | `Math.round(keeps / 3)` |

Buffer size to detect range change

> If a rendering anomaly occurs, for example: [this issue](https://github.com/mfuu/vue3-virtual-sortable/issues/29), you can reduce the value or set it to 0.

## `handle`

| **Type** | **Default** |
| -------- | ----------- |
| `String` | `-`         |

Drag handle selector within list items

## `group`

| **Type**        | **Default** |
| --------------- | ----------- |
| `Object/String` | `-`         |

```js
string: 'name'
object: {
  name: 'group',
  put: true | false,
  pull: true | false | 'clone',
  revertDrag: true | false
}
```

## `tableMode`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `false`     |

Display with table

## `keepOffset`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `false`     |

When scrolling up to load data, keep the same offset as the previous scroll

## `direction`

| **Type**                 | **Default** |
| ------------------------ | ----------- |
| `vertical \| horizontal` | `vertical`  |

Virtual list scroll direction

## `scroller`

| **Type**                  | **Default**       |
| ------------------------- | ----------------- |
| `Document \| HTMLElement` | Virtual list wrap |

Virtual list scrolling element

## `lockAxis`

| **Type** | **Default** |
| -------- | ----------- |
| `x \| y` | `-`         |

Axis on which dragging will be locked

## `debounceTime`

| **Type** | **Default** |
| -------- | ----------- |
| `Number` | `0`         |

debounce time on scroll

## `throttleTime`

| **Type** | **Default** |
| -------- | ----------- |
| `Number` | `0`         |

throttle time on scroll

## `sortable`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `true`      |

Whether the current list can be sorted by dragging

## `disabled`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `false`     |

Disables the sortable if set to true

## `draggable`

| **Type** | **Default**     |
| -------- | --------------- |
| `String` | `[role="item"]` |

Specifies which items inside the element should be draggable

## `animation`

| **Type** | **Default** |
| -------- | ----------- |
| `Number` | `150`       |

Animation speed moving items when sorting

## `autoScroll`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `true`      |

Automatic scrolling when moving to the edge of the container

## `scrollSpeed`

| **Type** | **Default**        |
| -------- | ------------------ |
| `Object` | `{ x: 10, y: 10 }` |

Vertical&Horizontal scrolling speed (px)

## `scrollThreshold`

| **Type** | **Default** |
| -------- | ----------- |
| `Number` | `55`        |

Threshold to trigger autoscroll

## `delay`

| **Type** | **Default** |
| -------- | ----------- |
| `Number` | `0`         |

Time in milliseconds to define when the sorting should start

## `delayOnTouchOnly`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `false`     |

Only delay on press if user is using touch

## `appendToBody`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `false`     |

Appends the ghost element into the document's body

## `dropOnAnimationEnd`

| **Type**  | **Default** |
| --------- | ----------- |
| `Boolean` | `true`      |

Whether to trigger the drop event when the animation ends

## `rootTag`

| **Type** | **Default** |
| -------- | ----------- |
| `String` | `div`       |

Label type for root element

## `wrapTag`

| **Type** | **Default** |
| -------- | ----------- |
| `String` | `div`       |

Label type for wrap element

## `wrapClass`

| **Type** | **Default** |
| -------- | ----------- |
| `String` | `-`         |

List wrapper element class

## `wrapStyle`

| **Type** | **Default** |
| -------- | ----------- |
| `Object` | `{}`        |

List wrapper element style

## `ghostClass`

| **Type** | **Default** |
| -------- | ----------- |
| `String` | `-`         |

The class of the mask element when dragging

## `ghostStyle`

| **Type** | **Default** |
| -------- | ----------- |
| `Object` | `{}`        |

The style of the mask element when dragging

## `chosenClass`

| **Type** | **Default** |
| -------- | ----------- |
| `String` | `-`         |

Class name for the chosen item

## `placeholderClass`

| **Type** | **Default** |
| -------- | ----------- |
| `String` | `-`         |

Class name for the drop placeholder
