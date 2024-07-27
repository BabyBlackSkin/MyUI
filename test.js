javascript:!function () {
    var t = "word-wrap:break-word;word-break:break-all;background:rgba(23, 23, 23, 0.8);border-radius:5px;text-align:center;top:10%;left:50%;width:500px;padding:30px 20px 20px;margin-left:-270px;font-size:18px;z-index:9999999999;color:#fff;position:fixed;box-shadow:rgba(0,0,0,.5)%2030px%2030px%2030px;%22,e=%22margin-bottom:24px;%22,i=%22color:#fff;display:inline-block;margin:0%2010px%200%200;padding:0;font-size:16px;width:96px;%22,n=%22width:350px;margin:0;padding:5px%205px%204px;font-size:14px;background:#fff;color:#111;display:inline-block;%22,o=%22display:inline-block;text-align:center;vertical-align:middle;-ms-touch-action:manipulation;touch-action:manipulation;cursor:pointer;background-image:none;border:1px%20solid%20transparent;white-space:nowrap;padding:5px%2012px;font-size:14px;line-height:1.42857143;border-radius:4px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;margin:0%2028px%200%200;background:#fff;color:#111;height:30px;width:80px;background-color:#007bff;border-color:#007bff;color:#fff;";

    function a(e, i) {
        var n = "showInfo", o = document.getElementById(n);
        o || ((o = document.createElement("div")).id = n, o.style.cssText = t, document.body.appendChild(o)), o.innerHTML = e, setTimeout((function () {
            o.style.display = "none", o.remove()
        }), i || 1500)
    }

    function s(t, o, a) {
        var s = document.createElement("div");
        s.style.cssText = e;
        var r = document.createElement("label");
        return r.innerHTML = t, r.style.cssText = i, s.appendChild(r), r = document.createElement("input"), r.value = o, r.placeholder = a, r.style.cssText = n, s.appendChild(r), s
    }

    function r(t, e, i) {
        var n = null;
        if (window.XMLHttpRequest) n = new XMLHttpRequest; else {
            if (!window.ActiveXObject) return a("您的浏览器不支持ajax，请使用Chrome浏览器"), 0;
            n = new ActiveXObject("Microsoft.XMLHTTP")
        }
        n.open("POST", e, !0), n.setRequestHeader("Content-Type", "application/json"), n.send(t), n.onreadystatechange = function () {
            var t;
            4 == n.readyState && (200 == n.status ? 0 == (t = JSON.parse(n.responseText)).err ? (a("同步成功"), i()) : a(t.msg) : a("同步失败"))
        }
    }

    !function () {
        var e, i = {
            "www.miaostreet.com": {
                title: "#body > div:nth-child(11) > div.rax-scrollview > div > div:nth-child(2) > div > span",
                price: "#body > div:nth-child(11) > div.rax-scrollview > div > div:nth-child(2) > div > div:nth-child(1) > div > span:nth-child(2)",
                thumb: "#body > div:nth-child(11) > div.rax-scrollview > div > div:nth-child(1) > div img",
                content: "#body > div:nth-child(11) > div.rax-scrollview > div > div:nth-child(9) > div img"
            },
            "detail.vip.com": {
                title: "#J_detail_info_mation > div > p.pib-title-detail",
                shopname: ".re-store-name",
                price: "#J-specialPrice-wrap > div > div.sp-info > div > span.sp-price",
                thumb: "#J-img-content img|data-original",
                content: ".dc-img-detail img|data-original",
                video: "#J_video_source_html5_api source"
            },
            "vipglobal.hk": {
                title: "#J_detail_info_mation > div > p.pib-title-detail",
                shopname: ".re-store-name",
                price: "#J-specialPrice-wrap > div > div.sp-info > div > span.sp-price",
                thumb: "#J-img-content img|data-original",
                content: ".dc-img-detail img|data-original",
                video: "#J_video_source_html5_api source"
            },
            "m.vip.com": {
                title: "#app > div > div.product-name-container > div > p",
                price: ".price",
                thumb: ".mint-swipe-items-wrap img|data-src",
                content: ".product-graphic img|data-src"
            },
            "www.shopin.net": {
                title: "#container > div:nth-child(1) > div.product-list > div.right.pr > h2",
                price: "#product_id1",
                color: "#colorddetails img",
                thumb: "#nav_item li img",
                content: ".box-product .tabBd .item img"
            },
            "detail.tmall.hk": {
                title: ".tb-detail-hd h1|.ItemHeader--mainTitle--3CIjqW5",
                shopname: ".slogo-shopname|.shop-intro .shopLink|.left1366top div div a|.ShopHeader--title--2qsBE1A",
                price: ".tm-price|.tm-promo-price .tm-price|.Price--priceText--2nLbVda",
                attr: ".Attrs--attr--33ShB6X|#J_AttrUL li",
                color: ".J_TSaleProp.tb-img li a|.skuItemWrapper .skuItem div",
                thumb: ".PicGallery--thumbnail--jnGMZYy img|#J_UlThumb img",
                content: "#description img|.descV8-richtext table tr td img|.lazyload",
                video: ".lib-video source"
            },
            "xiaomiyoupin.com": {
                title: ".good-name",
                price: ".value",
                thumb: ".thumb-pic img",
                content: ".main-body img"
            },
            "detail.tmall.com": {
                title: ".tb-detail-hd h1|.ItemHeader--mainTitle--3CIjqW5",
                shopname: ".slogo-shopname|.shop-intro .shopLink|.left1366top div div a|.ShopHeader--title--2qsBE1A",
                price: ".tm-price|.tm-promo-price .tm-price|.Price--priceText--2nLbVda",
                attr: ".Attrs--attr--33ShB6X|#J_AttrUL li",
                color: ".J_TSaleProp.tb-img li a|.skuItemWrapper .skuItem div",
                thumb: ".PicGallery--thumbnail--jnGMZYy img|#J_UlThumb img",
                content: "#description img|.descV8-richtext table tr td img|.lazyload",
                video: ".lib-video source"
            },
            "item.taobao.com": {
                title: "#J_Title > h3",
                shopname: "div.shop-name|.tb-shop-name a|.shop-name-link",
                price: ".tb-rmb-num|#J_PromoPriceNum",
                attr: ".attributes-list li",
                color: ".J_TSaleProp.tb-img li a",
                thumb: "#J_UlThumb img",
                content: "#description img|data-ks-lazyload",
                content1: "#J_DivItemDesc img"
            },
            "item.jd.com": {
                title: "body > div:nth-child(9) > div > div.itemInfo-wrap > div.sku-name",
                shopname: ".j-shopHeader .jLogo a|.name a",
                price: ".J-summary-price .price",
                style: "#J-detail-content style",
                thumb: ".spec-list img",
                content: ".detail-content img|data-lazyload",
                color: ".li.p-choose img",
                video: ".vjs-tech source"
            },
            "npcitem.jd.hk": {
                title: "body > div:nth-child(12) > div > div.itemInfo-wrap > div.sku-name",
                price: ".summary-price-wrap .J-summary-price .price",
                style: "#J-detail-content style",
                thumb: "#spec-list li img",
                attr: ".parameter2 li",
                color: ".li.p-choose img",
                content: "#J-detail-content img"
            },
            "www.okbuy.com": {
                title: "#prodTitleName",
                price: "#prodPriceAj",
                thumb: ".pBigPic img",
                content: "#mpro-ImgAndAttr img|original"
            },
            "goods.kaola.com": {
                title: "#j-producthead > div > dl > dt.product-title > span",
                price: ".currentPrice",
                color: ".valueBox ul li.imgbox",
                thumb: ".litimg_box img",
                attr: ".ellipsisGroup div.proValue",
                content: "#goodsDetail img|data-src",
                shopname: ".brand"
            },
            "product.suning.com": {
                title: "#itemDisplayName",
                price: ".mainprice",
                color: ".proinfo-color-ex ul.tip-infor li a",
                thumb: ".imgzoom-thumb-main img",
                attr: "#kernelParmeter li",
                content: "#productDetail img|src",
                shopname: ".header-shop-name"
            },
            "prich.tma1l.com.cn": {
                title: "#ECS_FORMBUY > h1",
                price: "#ECS_SHOPPRICE",
                thumb: "#imglist a img",
                content: "#com_v img"
            },
            "item.secoo.com": {
                title: "div.sopdetailsCon > div.contents.clearfix > div.info_r > div.proName > h2",
                color: ".proList .pdd ul li img",
                shopname: "body > div.sopdetailsCon > div.smallNav > p > a:nth-last-child(2)",
                price: "#secooPriceJs",
                thumb: ".info_l .move_box a|bigsrc",
                content: ".product-detail-div .moudle_details img|data-original"
            },
            ".*.womai.com": {title: ".last", thumb: ".items ul li img", content: ".content img"},
            "item.gome.com.cn": {
                title: ".hgroup h1",
                price: ".price",
                thumb: ".pic-small ul img",
                content: "#detailHtml img"
            },
            ".*.m.youzan.com": {
                title: ".goods-title__box > h2 > span",
                price: ".goods-activity .tee-text",
                thumb: ".image-swipe-item",
                content: ".cap-richtext img"
            },
            "s.taobao.com": {title: ".J_TGoldlog|.shop-name-link", items: ".J_ClickStat|.item-name.J_TGoldData"},
            "list.jd.hk": {title: ".selector-set em", items: ".p-name a"},
            "list.jd.com": {title: ".crumb-select-item em", items: ".p-name a"},
            "jd.com": {title: ".jLogo", items: ".jDesc a"},
            "jd.hk": {title: ".worldwide-menu-link", items: ".jDesc a"},
            "search.secoo.com": {title: ".smallList.brand", items: ".dl_name a"},
            "taobao.com": {
                title: ".J_TGoldlog|.shop-name-link",
                total_page: ".page-info",
                items: ".item-name.J_TGoldData"
            },
            "tmall.com": {
                title: ".slogo-shopname",
                total_page: ".ui-page-s-len",
                items: ".item-name.J_TGoldData|.item-name"
            },
            "tmall.hk": {title: ".slogo-shopname", total_page: ".ui-page-s-len", items: ".item-name.J_TGoldData"},
            "search.kaola.com": {title: ".title", items: ".titlewrap a"},
            "search.suning.com": {title: ".goods-list em", items: ".title-selling-point a"},
            "suning.com": {
                title: ".JS_storename|.search-path .l",
                items: ".sf-product .sf-proName a|.filter-results p.sell-point a.sellPoint"
            },
            "list.vip.com": {title: ".brandStore-name.J_brandName", items: ".c-goods-item a"},
            "category.vip.com": {title: ".c-breadcrumbs .c-breadcrumbs-cell-title span", items: ".c-goods-item a"},
            "search.shopin.net": {title: "#jFilter dl dd ul li a", items: ".content .productImg"},
            "gucci.cn": {title: ".spice-normal-box", items: ".spice-product-tiles-slot a.spice-item-grid"},
            "m.dewu.com": {
                title: ".spuBase_detail",
                price: ".price-content_number span",
                thumb: ".group_img .defaultImageCls img",
                content: ".imageAndText_img img",
                shopname: ".product-brand__info_title",
                attr: ".baseProperty-content_info"
            },
            "www.adidas.com.cn": {items: ".plp-list a"}
        }, n = {url: location.href, title: document.title, srcs: []}, l = 0, c = 0, d = [], u = location.hostname;
        for (e in i) {
            var A = new RegExp(e);
            if (null != u.match(A)) {
                u = e;
                break
            }
        }
        if (!(u in i)) return a("当前站点不支持同步，请联系管理员");
        for (e in i[u]) {
            var m = i[u][e];
            if ("toJSONString" != e) if ("items" == e) {
                for (var h = m.split("|"), p = 0; p < h.length; p++) {
                    var g, f, v = document.querySelectorAll(h[p]), w = [];
                    for (p = 0; p < v.length; p++) (g = v[p].getAttribute("href")).startsWith("//") && (g = "https:" + g), "gucci.cn" === u && g.startsWith("/zh") && (g = "https://www.gucci.cn" + g.split("?")[0]), "www.adidas.com.cn" === u && (g = "https://www.adidas.com.cn" + g), "s.taobao.com" == u && (v[p].innerText.length < 1 || g.startsWith("https://click")) || (f = {
                        url: g,
                        title: v[p].innerText,
                        shopname: n.title
                    }, "s.taobao.com" == u && (f.version = 101), w.push(f))
                }
                n.items = w
            } else if ("price" == e || "title" == e || "shopname" == e || "total_page" == e) for (h = m.split("|"), p = 0; p < h.length; p++) null != (y = document.querySelector(h[p])) && (n[e] = y.innerText.replace(/^\s+|\s+$/g, "")); else if ("attr" == e) {
                for (h = m.split("|"), p = 0; p < h.length; p++) if (0 != (y = document.querySelectorAll(h[p])).length) {
                    var b = {};
                    for (p = 0; p < y.length; p++) 2 <= (h = (h = (h = "m.dewu.com" == u ? y[p].innerText.split("\n") : y[p].innerText.split(":")).length < 2 ? y[p].innerText.split(" ") : h).length < 2 ? y[p].innerText.split("：") : h).length && (b[h[0].trim()] = h[1].trim()), console.log(h);
                    n.attr = b
                }
            } else if ("color" == e) {
                for (h = m.split("|"), p = 0; p < h.length; p++) {
                    m = h[p];
                    var y = document.querySelectorAll(m);
                    console.log(m, y);
                    var I = {};
                    if (0 != y.length) {
                        var C;
                        for (p = 0; p < y.length; p++) console.log(y[p]), console.log(y[p].getAttribute("src")), "item.secoo.com" == u || "www.shopin.net" == u ? I[y[p].getAttribute("src")] = y[p].getAttribute("title") : "npcitem.jd.hk" == u || "item.jd.com" == u ? I[y[p].getAttribute("src")] = y[p].getAttribute("alt") : "product.suning.com" == u ? I[(k = y[p].querySelector("img").getAttribute("src")).startsWith("//") ? document.location.protocol + k : k] = y[p].innerText : "goods.kaola.com" == u ? I[y[p].querySelector("img").getAttribute("src").replace(/\?.*$/g, "")] = y[p].getAttribute("title") : "detail.tmall.com" == u && ".skuItemWrapper .skuItem div" == m || "detail.tmall.hk" == u && ".skuItemWrapper .skuItem div" == m ? y[p].querySelector("img") && (I["https:" + y[p].querySelector("img").getAttribute("src")] = y[p].getAttribute("title")) : null != (C = (A = /url\((.*)\)/g).exec(y[p].getAttribute("style"))) && (I[C[1].startsWith("//") ? document.location.protocol + C[1] : C[1]] = y[p].text.trim())
                    }
                }
                n.color = I
            } else if ("style" == e) {
                if (null != (y = document.querySelector(m))) {
                    var x = y.innerText;
                    A = /url\((.*)\)/g;
                    for (console.log(A); C = A.exec(x);) d.push(C[1]), c += 1
                }
            } else if ("video" == e) null != (y = document.querySelector(m)) && null != (g = y.getAttribute("src")) && (g.startsWith("//") && (g = "https:" + g), n.video = g); else {
                for (h = m.split("|"), console.log(h), p = 0; p < h.length; p++) if (0 != (y = document.querySelectorAll(h[p])).length) for (p = 0; p < y.length; p++) {
                    var E = 2 == h.length ? h[1] : "src";
                    (k = null == (k = y[p].getAttribute(E)) && "src" != E ? y[p].getAttribute("src") : k) && (n.srcs.push(k), "thumb" == e ? l += 1 : c += 1)
                }
                if (d.length) for (p = 0; p < d.length; p++) n.srcs.push(d[p]);
                if ("thumb" == e && null != n.color) for (var k in n.color) n.srcs.push(k)
            }
        }
        for (p = 0; p < n.srcs.length; p++) n.srcs[p].startsWith("//") && (n.srcs[p] = "https:" + n.srcs[p]);
        n.price && null != (y = /([\d\.\,]+)/.exec(n.price)) && (n.price = y[1]), console.log(n);
        var B = document.createElement("div");
        B.style.cssText = t + "padding-top:20px", (x = document.createElement("div")).style.cssText = "font-size:18px;margin-bottom:16px", x.innerHTML = "正在采集中", B.appendChild(x);
        var S = "轮播图(" + l + ") + 详情图(" + c + ")";
        for (null != n.color && (S += " + 规格图(" + Object.keys(n.color).length + ")"), null != n.items && (n.price = 0, S = "获取到商品列表: " + n.items.length, delete n.srcs), childs = [s("商品标题", n.title), s("商品价格", n.price), s("商品图片数", S), s("采图码", "", "请粘贴采图码")], p = 0; p < childs.length; p++) B.appendChild(childs[p]);
        var _ = document.createElement("div");
        _.style.cssText = "text-align: center";
        var N = document.createElement("button");
        N.setAttribute("id","MOMOMOBTN")

        N.innerHTML = "确定", N.style.cssText = o, _.appendChild(N),
            (S = document.createElement("button")).innerHTML = "取消",
            S.style.cssText = o,
            _.appendChild(S),
            B.appendChild(_),
            document.body.appendChild(B),
            document.addEventListener("paste", (function (t) {
                t.clipboardData && t.clipboardData.items && (t = t.clipboardData.getData("text"), childs[3].querySelector("input").value = t)
            })),
            S.onclick = function () {
                B.remove()
            },
            N.onclick = function () {
                var t;
                a("正在发送中...", 3e5),
                    n.token = "10628674",
                    n.thumb = l,
                    n.version = 1,
                    n.title = childs[0].getElementsByTagName("input")[0].value,
                    n.pro_md5 = childs[3].getElementsByTagName("input")[0].value,
                    n.referer = document.referer,
                    console.log(JSON.stringify(n));
                    // null != n.items ?
                    // (t = "https://k100api-pre.chinabeego.com/material/goodsMaterial/saveGoodMaterial", r(JSON.stringify(n), t, (function () {
                    //     B.remove()
                    // })))
                        // :
                //         (t = "https://k100api-pre.chinabeego.com/" + ("https://k100api-pre.chinabeego.com".indexOf("chinabeego"), "material/goodsMaterial/saveGoodMaterial"), r(JSON.stringify(n), t, (function () {
                //     0 <= "https://k100api-pre.chinabeego.com".indexOf("chinabeego") ? B.remove() : r(JSON.stringify(n), "https://k100api-pre.chinabeego.com:19443/material/goodsMaterial/saveGoodMaterial", (function () {
                //         console.log("https://k100api-pre.chinabeego.com"), B.remove()
                //     }))
                // })))
            }
    }()
}
()
