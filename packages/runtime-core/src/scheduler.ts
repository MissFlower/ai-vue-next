const p = Promise.resolve()
const queue: any[] = []
let isFlushPending = false
export function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job)
  }

  queueFlush()
}

export function nextTick(fn) {
  typeof fn ? p.then(fn) : p
}

function queueFlush() {
  if (isFlushPending) {
    return
  }
  isFlushPending = true

  nextTick(flushJobs)
}

function flushJobs() {
  isFlushPending = false
  let job
  while ((job = queue.shift())) {
    job && job()
  }
}
