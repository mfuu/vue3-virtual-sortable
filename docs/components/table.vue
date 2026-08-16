<template>
  <virtual-list
    v-model="list"
    data-key="id"
    handle=".handle"
    class="virtual-list"
    chosen-class="chosen"
    :table-mode="true"
  >
    <template v-slot:header>
      <thead style="position: sticky; top: 0;">
        <tr>
          <th style="width: 15%">index</th>
          <th style="width: 25%">name</th>
          <th style="width: 60%">content</th>
        </tr>
      </thead>
    </template>
    <template v-slot:item="{ item, index, key }">
      <tr>
        <td>
          <span class="index">#{{ item.index }}</span>
          <span class="handle">☰</span>
        </td>
        <td>{{ item.name }}</td>
        <td>{{ item.desc }}</td>
      </tr>
    </template>
  </virtual-list>
</template>

<script setup>
import { ref } from 'vue';
import { getPageData } from '../public/sentence';

const list = ref(getPageData(1000, 0));
</script>

<style scoped>
.virtual-list {
  height: 500px;
  padding: 0 5px;
}

.list-item {
  position: relative;
  border-radius: 5px;
  box-shadow: 0px 2px 10px -5px #57bbb4;
  padding: 16px;
}

.item-title {
  display: flex;
  justify-content: space-between;
}

.index {
  float: left;
}

.handle {
  cursor: grab;
  text-align: right;
}

.chosen {
  box-shadow: 0px 0px 0px 2px #306aa4;
}
</style>
