import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Vant styles
import 'vant/lib/index.css'
import './style.css'

// Vant 组件注册
import {
  Form, CellGroup, Field, Button, Icon, Image, Badge, Tag,
  NavBar, Tabbar, TabbarItem, Loading, Empty, PullRefresh, List,
  Steps, Step, Tab, Tabs, ActionSheet, Dialog, Overlay, NoticeBar,
  Search, Uploader, RadioGroup, Radio, Switch as VanSwitch,
  Cell
} from 'vant'

const app = createApp(App)

app.use(Form)
app.use(CellGroup)
app.use(Field)
app.use(Button)
app.use(Icon)
app.use(Image)
app.use(Badge)
app.use(Tag)
app.use(NavBar)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Loading)
app.use(Empty)
app.use(PullRefresh)
app.use(List)
app.use(Steps)
app.use(Step)
app.use(Tab)
app.use(Tabs)
app.use(ActionSheet)
app.use(Dialog)
app.use(Overlay)
app.use(NoticeBar)
app.use(Search)
app.use(Uploader)
app.use(RadioGroup)
app.use(Radio)
app.use(VanSwitch)
app.use(Cell)

app.use(createPinia())
app.use(router)
app.mount('#app')
