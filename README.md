# 聊天模拟器

## 缘起

偶然看到了 羡辙 大佬的 [主页](http://zhangwenli.com/)， 非常喜欢这个小功能，于是就想着自己也实现一下

## 效果
![](http://ozgadrk0y.bkt.clouddn.com/18-8-16/19413776.jpg)

## 过程

本人不才，是对 羡辙 的源代码进行了改进，在消化中成为自己的东西，目前已经用  `vue-cli` 搭起了 `webpack` 的 `vue` 工程，原项目采用的是  `gulp`

技术栈方面，替换了  `zepto` 为原生 `js`

## 坑点

```javascript
export function onImageLoad () {
  return new Promise(resolve => {
    /// 一开始使用的是 queryselectorAll，但是后来发现一直在报错，原因是 queryselectorAll 返回的是快照，不是实时更新的
    const img = document.getElementById('mock-msg').getElementsByTagName('img')
    if (img.length === 0) {
      return resolve()
    }
    function imgLoad (img) {
      img.removeEventListener('load', imgLoad)
      img.complete && resolve()
    }
    // getElementByTagName 返回的是 动态的，且返回的是 类数组，所以需要 Array.from 转换为数组
    Array.from(img).forEach(img => {
      img.addEventListener('load', imgLoad(img))
    })
  })
}
``` 