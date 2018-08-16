<template>
<div id="app">
  <div id="mobile" :class="{'has-prompt': hasPrompt}">
    <div id="mobile-head">
      <div id="mobile-head-title">与贝贝聊天中</div>
    </div>
    <div id="mobile-body">
      <div id="mobile-body-bg"></div>
      <div id="mobile-body-content">
        <div id="mock-msg-row" class="msg-row">
          <div id="mock-msg" class="msg" v-html="latestMsgContent"></div>
        </div>
        <div class="msg-row"
          v-for="(msg, index) in messages"
          :key="index"
          :class="msg.author === 'xianzhe' ? 'msg-xianzhe' : 'msg-me'"
        >
          <div class="msg"
            :class="'msg-bounce-in-' + (msg.author === 'xianzhe' ? 'left' : 'right')"
            :style="msg.width && msg.height && {width: msg.width - 26 + 'px', height: msg.height - 18 + 'px'}"
            v-html="msg.content"
          ></div>
        </div>
      </div>
    </div>
    <div id="mobile-foot">
      <div id="prompt">
        <div id="prompt-head">
          <div class="say-something">说点什么....</div>
          <a href="javascript:;" class="close-btn" @click="togglePrompt(false)"></a>
        </div>
        <div id="prompt-body">
          <ul class="responses" v-if="lastDialog">
            <li v-for="res in lastDialog.responses" :key="res.content">
              <a href="javascript:;" @click="respond(res)">{{ res.content }}</a>
            </li>
          </ul>
          <div class="next-topic"
            v-if="!lastDialog || !lastDialog.responses"
          >
            <ul class="topics">
              <li v-for="topic in nextTopics" :key="topic.brief">
                <a href="javascript:;" @click="ask(topic)">{{topic.brief}}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div id="input-hint" class="say-something"
        @click="togglePrompt(true)"
        :class="{'clickable': !isXianzheTyping}"
      >
        <span v-if="!isXianzheTyping">说点什么...</span>
        <span v-else>贝贝正在输入中</span>
      </div>
    </div>
    <div id="prompt-bg" @click="togglePrompt(false)"></div>
  </div>
</div>
</template>

<script>
import chatJSON from './assets/dialog.json'
import * as VARIABLE from './utils/variable.js'
import { getRandomMsg, delay, getMockMsgSize, onImageLoad, updateScroll } from './utils/utils.js'
export default {
  name: 'chat',
  data () {
    return {
      latestMsgContent: null,
      messages: [],
      dialogs: null,
      lastDialog: null,
      msgChain: Promise.resolve(),
      isXianzheTyping: false,
      nextTopics: [],
      hasPrompt: false
    }
  },
  mounted () {
    this.dialogs = chatJSON
    this.nextTopics = this.dialogs.fromUser
    this.appendDialog('0000')
  },
  methods: {
    appendDialog (id) {
      if (typeof id === 'object' && id.length > 0) {
        id.forEach(id => this.appendDialog(id))
        return
      } else if (id === null) {
        this.lastDialog.responses = null
        return
      }

      this.isXianzheTyping = true

      const dialog = this.getDialog(id)

      getRandomMsg(dialog.details)
        .forEach(content => {
          this.msgChain = this.msgChain
            .then(() => delay(700))
            .then(() => this.sendMsg(content, VARIABLE.AUTHOR.XIANZHE))
        })
      return dialog.nextXianzhe
        ? this.appendDialog(dialog.nextXianzhe)
        : this.msgChain.then(() => {
          this.lastDialog = dialog
          this.isXianzheTyping = false
        })
    },
    sendMsg (message, author) {
      switch (author) {
        case 'me':
          return this.sendUserMsg(message)
        default:
          return this.sendFriendMsg(message, author)
      }
    },
    sendFriendMsg (message, author) {
      const content = getRandomMsg(message)
      const length = content.replace(/<[^>]+>/g, '').length
      const isImg = /<img[^>]+>/.test(content)
      const isTyping = length > 5 || isImg

      const msg = {
        author: author,
        content: isTyping ? VARIABLE.TYPING_MSG_CONTENT : content,
        isImg: isImg
      }

      this.messages.push(msg)

      if (isTyping) {
        this.markMsgSize(msg)
        setTimeout(updateScroll)
        return delay(Math.min(100 * length, 2000))
          .then(() => {
            return this.markMsgSize(msg, content)
          })
          .then(() => delay(150))
          .then(() => {
            msg.content = content
          })
      }

      setTimeout(updateScroll)
      return Promise.resolve()
    },
    sendUserMsg (message) {
      this.messages.push({
        author: VARIABLE.AUTHOR.ME,
        content: message
      })
      return Promise.resolve()
    },
    markMsgSize (msg, content = null) {
      this.latestMsgContent = content || msg.content

      return delay(0)
        .then(() => msg.isImg && onImageLoad())
        .then(() => {
          Object.assign(msg, getMockMsgSize())
          this.messages = [...this.messages]
        })
    },
    getDialog (id) {
      const dialogs = this.dialogs.fromXianzhe.filter(dialog => dialog.id === id)
      return dialogs ? dialogs[0] : null
    },
    getDialogFromUser (id) {
      const dialogs = this.dialogs.fromUser
        .filter(dialog => dialog.id === id)
      return dialogs ? dialogs[0] : null
    },
    togglePrompt (toShow) {
      if (this.isXianzheTyping) {
        return
      }
      this.hasPrompt = toShow
    },
    respond (response) {
      return this.say(response.content, response.nextXianzhe)
    },
    ask (fromUser) {
      const content = getRandomMsg(fromUser.details)
      return this.say(content, fromUser.nextXianzhe)
    },
    say (content, dialogId) {
      this.hasPrompt = false

      return delay(200)
        .then(() => this.sendMsg(content, VARIABLE.AUTHOR.ME))
        .then(() => delay(300))
        .then(() => this.appendDialog(dialogId))
    }
  }
}
</script>

<style lang="scss">

</style>
