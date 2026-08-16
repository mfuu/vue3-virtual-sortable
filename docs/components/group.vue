<template>
  <div class="group-list">
    <virtual-list
      v-model="list1"
      data-key="id"
      handle=".handle"
      :group="group"
      chosen-class="chosen"
      class="virtual-list"
    >
      <template v-slot:item="{ item, index, key }">
        <div class="list-item">
          <div class="item-title">
            <span class="index">#{{ item.index }}-{{ item.name }}</span>
            <span class="handle">☰</span>
          </div>
        </div>
      </template>
    </virtual-list>

    <virtual-list
      v-model="list2"
      data-key="id"
      handle=".handle"
      :group="group"
      chosen-class="chosen"
      class="virtual-list"
    >
      <template v-slot:item="{ item, index, key }">
        <div class="list-item">
          <div class="item-title">
            <span class="index">#{{ item.index }}-{{ item.name }}</span>
            <span class="handle">☰</span>
          </div>
        </div>
      </template>
    </virtual-list>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getPageData } from '../public/sentence';

const list1 = ref(getPageData(1000, 0));
const list2 = ref(getPageData(1000, 0));
const group = ref({ name: 'group', pull: true, put: true });
</script>

<style scoped>
.group-list {
  display: flex;
  justify-content: space-between;
}

.virtual-list {
  height: 500px;
  width: 49%;
  padding: 5px;
  display: inline-block;
}

.list-item {
  position: relative;
  border-radius: 5px;
  box-shadow: 0px 2px 10px -5px #57bbb4;
  padding: 16px;
  height: 50px;
  overflow: hidden;
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
