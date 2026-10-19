---
title: Deepseek-4.1-flash-1017 实测
date: 2026-10-19 12:19:34
tags:
---

这个月突然发现 deepseek-4.1-flash 模型更新了，我手里恰好有 command code goat 套餐，它的 fast 模型是直接接官方 deepseek 渠道，所以会直接用起来会很快，索性我就尝试了一下两个例子，在下面简单展示一下。

例子 1 让它做一个海浪沙滩，动态效果要求比较强一些，完整提示词如下（来源于 X ）：

> Build a single-file Three.js r128 (cdnjs) WebGL page titled "Ocean Shallows": a top-down view of a tropical sea filling the whole screen, with a small curved beach in the top-left corner.
>
> Water:
>
> - GPU height-field ripple simulation with absorbing screen edges.
> - Refraction and moving caustics.
> - Long swell rolling toward the shore, plus fine sun glitter.
> - Depth-based color: pale turquoise near the beach, deep sapphire offshore.
> - On the beach, waves break, rush up the sand as foamy swash with lace foam, then drain back and leave glossy wet sand.
> - The shadow of a swaying palm (trunk and fronds) falls across the beach and the shallows.

视频展示：

<video controls playsinline preload="metadata" style="width: 100%; height: auto;">
  <source src="/img/video/Ocean.mp4" type="video/mp4">
</video>

这个例子我使用的是官 key，配合 dsh 使用很流畅。完整效果：<a href="/works/model_test/ocean-shallows.html" target="_blank" rel="noopener">在线体验 Ocean Shallows</a>。

例子 2 让它做一个日式风格的街角便利店，对于这类 one-shot 直出的任务，它工作事件超级长，就单纯例 2 来说它的工作时间达到了一个半小时。同时这个例子我就用的是 command code goat 套餐提供的官 key 渠道模型，速度也很不错，相比直接用官 key，它性价比稍微高一些。例 2 完整提示词如下：

> 请制作一个雨夜便利店街角小场景，不准使用blender，以第三视角观察整个场景，整体像一个可以自由拖拽、旋转、缩放观看的微缩三维模型 / 小型景观，没有任何UI界面元素。地面为一个完整的正方形底座，所有元素都搭建在这个底座上，构图紧凑、层次清晰，整体呈现出小巧、精致、可收藏的模型感。画面风格为三渲二，强调浓厚的日式二次元动画氛围，材质表现干净，轮廓明确，色彩柔和但富有夜景霓虹的层次感。场景主体是一处日式便利店街角，便利店位于底座的视觉中心，外部有典型的日式街角元素：便利店招牌、玻璃橱窗、自动门、屋檐雨棚、门口地垫、自动贩卖机、自行车、雨伞架、垃圾桶、路灯、电线杆、电线、路牌、街角护栏、停车位、排水沟、积水路面、反光斑马线、小巷入口、空调外机、小型公告栏或海报栏等。街道不需要太大，但要有明确的街角转折感，像日本动画里常见的夜晚社区一角。不要人物，但便利店内部一定要有足够内容，并且可以透过大面积玻璃窗清楚看到店内。店内可见典型便利店陈设，例如：整齐排列的货架、饮料柜、便当区、饭团和零食陈列、收银台、咖啡机、杂志架、宣传海报、店内灯箱、冰柜、关东煮柜台、地面导视、储物柜或后场门等。要让便利店内部显得明亮、温暖、真实、充实，与室外潮湿昏暗的雨夜形成鲜明对比，营造出非常典型的日式动画雨夜氛围。美术风格重点强调：高精细建模、三渲二卡通渲染、清晰的轮廓线、细腻但简洁的材质层次、湿润的夜景反光、暖色室内灯光与冷色雨夜街景对比、浓厚的二次元日常场景感。整体气质应偏向安静、治愈、带一点都市夜晚孤独感但依然温暖，像一幕被定格下来的日本动画街角场景模型。加入一些基础动效来增强生命力：持续降雨、屋檐滴水、地面积水波纹、便利店招牌或灯箱轻微闪烁、自动门偶尔开合、雨水沿玻璃滑落、街道路面积水反射灯光、远处交通信号灯微弱变化等。整体效果应像一个静止而精致的三维微缩世界，但带有恰到好处的细微动态，突出其三渲二、二次元、雨夜、便利店、街角、小巧精致的核心特征。

视频展示：

<video controls playsinline preload="metadata" style="width: 100%; height: auto;">
  <source src="/img/video/market.mp4" type="video/mp4">
</video>

完整效果：<a href="/works/model_test/market/" target="_blank" rel="noopener">在线体验 星野マート</a>。

我逐渐在从 gpt，claude 等模型转向 ds ，kimi 等国模。首先价格是一个影响因素，模型稳定性也是一个很重要的点。就拿 openai 订阅提供的模型服务举例（我是长期订阅 openai pro 20x 套餐），国外闭源厂商的模型降智行为真的很影响工作进度，同时并不是所有任务都需要顶尖的智能。对于在当前这个 AI 时代飞速发展的开发者来说，能够判断什么任务可以由什么级别的模型解决并用其解决是一个很重要的能力。如果世界上所有任务都一股脑拿 openai 的 gpt-6-astra 做完了，那人在其中毫无作用，这个事情也会变得很无趣。

当我选择用适合的智能水平的模型+我的能力去完成一些恰恰能解决的事情，我才能在这个过程中体会到我的作用以及我的进步。Deepseek-4.1-flash-1017 的进步就让我十分惊喜，我更希望我的能力能够同它一起进步，最终能做到做一些单个人或者单个 Agent 边界以外的事情。
