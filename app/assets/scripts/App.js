import '../styles/styles.css'
import 'lazysizes'
import MobileMenu from './modules/MobileMenu'
import RevealOnScroll from './modules/RevealOnScroll'
import StickyHeader from './modules/StickyHeader'

// maybe checkout "eventemitter" (https://nodejs.org/api/events.html#events_class_eventemitter)
// if need arises for more complex module communication (see end of Lesson 56 on Webpack)
new StickyHeader()
new RevealOnScroll(document.querySelectorAll(".feature-item"), 75)
new RevealOnScroll(document.querySelectorAll(".testimonial"), 60)
new MobileMenu();
let modal

document.querySelectorAll(".open-modal").forEach(el => {
  el.addEventListener("click", e => {
    e.preventDefault()
    if (typeof modal == "undefined") {
      import(/* webpackChunkName: "modal" */ './modules/Modal').then(x => {
        modal = new x.default()
        setTimeout(() => modal.openTheModal(), 20)
      }).catch(() => console.log("Problem loading modal in App.js"))
    } else {
      modal.openTheModal()
    }
  })
})

if (module.hot) {
  module.hot.accept()
}

/* Lesson 42 example code below this line */
