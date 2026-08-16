# Getting Started

## Installation

::: code-group

```sh [npm]
$ npm i vue-virtual-sortable@next
```

```sh [yarn]
$ yarn add vue-virtual-sortable@next
```

:::

## Simple Usage

```vue
<template>
  <virtual-list
    v-model="list"
    data-key="id"
  >
    <template v-slot:item="{ item, index, key }">
      <div>
        item slot content
      </div>
    </template>
  </virtual-list>
</template>

<script setup>
import VirtualList from 'vue-virtual-sortable';
import { ref } from 'vue';

const list = ref([{ id: 'a', text: 'a', id: 'b', text: 'b' }]);
</script>
```
