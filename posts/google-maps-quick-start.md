---
title: Google Maps 开发入门
date: 2018-06-10 04:49:12
tags:
      - Map
      - Google
---


# google maps 快速入门

> 公司做的是地产信息查询，接入 google maps 是用来在地图页中显示所有地图点上对应的房源，让用户方便通过地图查看房源信息。在地图里大概会使用到地图库以及地图 maker ,地图 markercluster 等功能.. 有些功能比较头疼，所以就稍微罗列一下，做个记录。

<more></more>

## 快速接入地图

在开发 vue 项目时，我们一开始使用的是 `vue2-google-maps` 这个plugin 来接入的 google maps，但是后来发现这个插件长久未更新，插件内引入的 google map script 会被强制升级成 v3 版本的，这样会导致各种[奇怪的不兼容bug](https://www.mail-archive.com/search?l=google-maps-js-api-v3@googlegroups.com&q=subject:%22%5C%5BGoogle+Maps+API+v3%5C%5D%22&o=newest&f=1)，所以就把插件移除掉，直接 script 引入 google map v3 js 使用。
不过最近 google maps api 突然涨价，这让我们小公司比较头疼，所以现在又开始重构地图然后把地图库修改成功能差不多的 leaflet，不过这是后话，下次有时间再说下 leaflet 的使用吧..

以上是背景，下面就直接介绍下google maps 的接入使用吧。

**注：以下代码是在 vue 项目中实际使用的代码**

```html
<div ref="map"></div>
<div v-if='selectedHouses' v-for='(selectedHouse, index)  in selectedHouses' :key='index'>
    <div>{{selectedHouse.title}}</div>
    <div>{{selectedHouse.name}}</div>
    <img :src='selectedHouse.img_url' />
</div>
```

### 初始化地图，并添加必要的地图处理回调函数

```javascript
// 初始化地图插件
// 地图初始化
this.map = new google.maps.Map(this.$refs.map, {
    clickableIcons: false,
    uiZoomControls: true,
    fullscreenControl: false,
    streetViewControl: false,
    gestureHandling: 'greedy',
    maxZoom: 18,
    minZoom: 8,
    zoom: zoom, 
    center: new google.maps.LatLng({
        lat: 43.6532,
        lng: -79.3832
      })
})
// 侦听地图的事件
// idle 会在每一次对地图进行 zoomin zoomout drag, 地图初始化的时候进行触发，如果想要在地图初始化的时候加载数据点生成 marker，在这个回调中使用最为合适
this.map.addListener('idle', () => {
  this.idleFiredCallback()
})
// drag 只有在地图拖拽的时候才会触发
this.map.addListener('drag', () => {
    this.dragCallback()
})
// zoom change 只有在地图zoomIn 或者 zoomOut 的时候才会触发
this.map.addListener('zoom_changed', () => {
    this.zoomChangedCallback()
})
// 参考：google maps events 触发顺序
// https://developers.google.com/maps/documentation/javascript/events
```

在地图初始化的时候绘制 marker, 只要地图的 bounds （地图容器的四个角）有任何变化，就触发数据请求，重新更新当前地图位置的所有 marker

```javascript
idleFiredCallback () {
  let zoom = this.map.getZoom()
  let ne = this.map.getBounds().getNorthEast()
  let sw = this.map.getBounds().getSouthWest()
  let extraHeight, extraWidth
  if (zoom >= 17) {
    extraHeight = (ne.lat() - sw.lat())
    extraWidth = (ne.lng() - sw.lng())
  }
  if (zoom >= 16) {
    extraHeight = (ne.lat() - sw.lat()) / 2
    extraWidth = (ne.lng() - sw.lng()) / 2
  } else {
    extraHeight = 0
    extraWidth = 0
  }
  let bounds = {
    lat1: ne.lat() + extraHeight,
    lon1: ne.lng() + extraWidth,
    lat2: sw.lat() - extraHeight,
    lon2: sw.lng() - extraWidth
  }
  // api 请求的代码就稍微用个 searchApi 方法意思一下，你们知道这是后端请求就可以了。
  let markerCollect = []
  this.searchAPI({data: {bounds: this.bounds}}).then((response) => {
    for (let marker in response.data.markers) {
        // 循环创建 marker
        markerCollect.push(this.createMarker(marker))
    }
  })
},
createMarker(markers) {
    // 初始化 marker object
    // 注：如果想让 marker 直接显示在地图上，config 中指定 mapObject {..., map: this.map}
    // 如果需要让markercluster 决定是显示 marker 还是在聚合点中聚合，则不需要这个属性，将 marker 返回交给 markercluster 集中处理
    let marker = new google.maps.Marker({
      position: {
        lat: item.lat,
        lng: item.lng
      },
      label: {
        color: '#fff',
        fontSize: '10px',
        text: item.price
      },
      icon: 'img/marker_40.png',
      color: '#fff',
      data: item
    })
    marker.addListener('click', () => {
        // 当前marker选中状态，选中 marker 的时候弹出一个弹出层预览房源详细信息
        // 设置当前选中时的 active icon 
        marker.setIcon(this.markerStyle.activeIcon)
        this.previewApi({data: marker.data}).then(response => {
            // 选中房源后向后台请求对应的详细信息，渲染到前台
            this.selectedHouses = [response.data.house]
        })
    })
    return marker
}
```

### 聚合点markercluster 的使用,并添加必要的回调函数

初始化 markercluster，需要 google maps 实例化完成之后进行调用

```javascript
// MarkerClusterer(map:google.maps.Map, opt_markers?:Array.<google.maps.Marker>, opt_options?:MarkerClustererOptions)
this.markerClusterer = new MarkerClusterer(this.map, null, {
    zoomOnClick: false,
    gridSize: 48,
    averageCenter: true,
    styles: [this.markerClustererStyles]
})
// 点击集合点时的回调函数
google.maps.event.addListener(this.markerClusterer, 'click', (cluster) => {
    this.clickClusterCallback(cluster)
})
```

markercluster 聚合点需要在 createMarker 完成之后将所有创建的 marker 通过 cluster 的 API 进行处理，然后在前端显示

```javascript
// 上面的 idleFiredCallback, 添加 markercluster 的处理逻辑
idleFiredCallback () {
    ...
    let markerCollect = []
    this.searchAPI({data: {bounds: this.bounds}}).then((response) => {
        for (let marker in response.data.markers) {
            // 循环创建 marker
            markerCollect.push(this.createMarker(marker))
        }
        // marker 创建完毕，通过 cluster api 把 marker 全部绑定到 map，并添加显示逻辑
        if (markerCollect.length) {
            this.markerClusterer.addMarkers(markerCollect)
        } else {
            // 如果没有 marker,那就清空当前地图页的 markers
            if (markerCoolect === 0 && this.markerClusterer) {
              this.markerClusterer.clearMarkers()
            }
        }
    })
}
```

点击聚合点的操作逻辑

```javascript
clickClusterCallback (cluster) {
    // 点击集合点时进行回调
    let markers = cluster.getMarkers()
    let dataArray = markers.map(({data}) => data)
    if (this.map.getZoom() >= 16 || (this.map.getZoom() >= 15 && markers.length <= 3)) {
      //如果 zoomlevel >= 16, 不再放大, 直接预览房源 ||  如果 zoomlevel >= 15, 少于3个点, 不再放大, 直接预览房源
      this.selectedHouses = dataArray
    } else {
      // 放大 2 级
      this.map.setCenter(cluster.getCenter())
      this.map.setZoom(this.map.getZoom() + 2)
    }
    return true
}
```

至此，地图就已创建完毕，可能还有一些细节的地方，比如地图 marker 缓存之类的就在实际使用的时候自行添加就可以了。