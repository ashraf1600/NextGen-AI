<template>
  <div class="ng-terminal">
    <div class="ng-terminal-bar">
      <span></span><span></span><span></span>
    </div>
    <div class="ng-terminal-body">
      <div v-for="(line, i) in visibleLines" :key="i" class="ng-line">
        <template v-if="line.type === 'cmd'">
          <span class="prompt">$</span> <span class="cmd">{{ line.shown }}</span>
        </template>
        <template v-else>
          <span class="out">{{ line.shown }}</span>
        </template>
        <span v-if="i === activeIndex" class="ng-cursor"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const script = [
  { type: 'cmd', text: 'whoami' },
  { type: 'out', text: '> বাংলাদেশী ডেভেলপার — AI শিখছি, বাংলায় 🇧🇩' },
  { type: 'cmd', text: 'ls skills/' },
  { type: 'out', text: 'LangChain  LangGraph  DRF  RAG  Agents  Vector-DB' },
  { type: 'cmd', text: 'npm run docs:dev' },
  { type: 'out', text: '➜  Local: http://localhost:5173/' },
  { type: 'out', text: '➜  একবারে একটা chapter — গভীরভাবে শেখো 🚀' },
]

const visibleLines = ref([])
const activeIndex = ref(0)
let timeoutId = null

function typeLine(lineIdx) {
  if (lineIdx >= script.length) return

  const full = script[lineIdx].text
  visibleLines.value.push({ type: script[lineIdx].type, shown: '' })
  activeIndex.value = lineIdx

  let charIdx = 0
  const speed = script[lineIdx].type === 'cmd' ? 55 : 12

  function typeChar() {
    if (charIdx <= full.length) {
      visibleLines.value[lineIdx].shown = full.slice(0, charIdx)
      charIdx++
      timeoutId = setTimeout(typeChar, speed)
    } else {
      timeoutId = setTimeout(() => typeLine(lineIdx + 1), 350)
    }
  }
  typeChar()
}

onMounted(() => {
  typeLine(0)
})

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
})
</script>