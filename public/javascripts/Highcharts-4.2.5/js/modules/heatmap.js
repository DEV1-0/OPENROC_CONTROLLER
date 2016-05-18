/*
 Highcharts JS v4.2.5 (2016-05-06)

 (c) 2011-2016 Torstein Honsi

 License: www.highcharts.com/license
 */
(function (d) {
    typeof module === "object" && module.exports ? module.exports = d : d(Highcharts)
})(function (d) {
    var m = d.Axis, q = d.Chart, i = d.Color, x = d.Legend, s = d.LegendSymbolMixin, t = d.Series, y = d.Point, u = d.getOptions(), h = d.each, r = d.extend, v = d.extendClass, z = d.isNumber, j = d.merge, k = d.pick, o = d.seriesTypes, w = d.wrap, n = function () {
    }, p = d.ColorAxis = function () {
        this.isColorAxis = !0;
        this.init.apply(this, arguments)
    };
    r(p.prototype, m.prototype);
    r(p.prototype, {
        defaultColorAxisOptions: {
            lineWidth: 0,
            minPadding: 0,
            maxPadding: 0,
            gridLineWidth: 1,
            tickPixelInterval: 72,
            startOnTick: !0,
            endOnTick: !0,
            offset: 0,
            marker: {animation: {duration: 50}, color: "gray", width: 0.01},
            labels: {overflow: "justify"},
            minColor: "#EFEFFF",
            maxColor: "#003875",
            tickLength: 5
        }, init: function (a, b) {
            var c = a.options.legend.layout !== "vertical", f;
            f = j(this.defaultColorAxisOptions, {side: c ? 2 : 1, reversed: !c}, b, {
                opposite: !c,
                showEmpty: !1,
                title: null,
                isColor: !0
            });
            m.prototype.init.call(this, a, f);
            b.dataClasses && this.initDataClasses(b);
            this.initStops(b);
            this.horiz = c;
            this.zoomEnabled = !1
        }, tweenColors: function (a,
                                  b, c) {
            var f;
            !b.rgba.length || !a.rgba.length ? a = b.input || "none" : (a = a.rgba, b = b.rgba, f = b[3] !== 1 || a[3] !== 1, a = (f ? "rgba(" : "rgb(") + Math.round(b[0] + (a[0] - b[0]) * (1 - c)) + "," + Math.round(b[1] + (a[1] - b[1]) * (1 - c)) + "," + Math.round(b[2] + (a[2] - b[2]) * (1 - c)) + (f ? "," + (b[3] + (a[3] - b[3]) * (1 - c)) : "") + ")");
            return a
        }, initDataClasses: function (a) {
            var b = this, c = this.chart, f, e = 0, l = this.options, g = a.dataClasses.length;
            this.dataClasses = f = [];
            this.legendItems = [];
            h(a.dataClasses, function (a, d) {
                var h, a = j(a);
                f.push(a);
                if (!a.color)l.dataClassColor ===
                "category" ? (h = c.options.colors, a.color = h[e++], e === h.length && (e = 0)) : a.color = b.tweenColors(i(l.minColor), i(l.maxColor), g < 2 ? 0.5 : d / (g - 1))
            })
        }, initStops: function (a) {
            this.stops = a.stops || [[0, this.options.minColor], [1, this.options.maxColor]];
            h(this.stops, function (a) {
                a.color = i(a[1])
            })
        }, setOptions: function (a) {
            m.prototype.setOptions.call(this, a);
            this.options.crosshair = this.options.marker;
            this.coll = "colorAxis"
        }, setAxisSize: function () {
            var a = this.legendSymbol, b = this.chart, c, f, e;
            if (a)this.left = c = a.attr("x"), this.top =
                f = a.attr("y"), this.width = e = a.attr("width"), this.height = a = a.attr("height"), this.right = b.chartWidth - c - e, this.bottom = b.chartHeight - f - a, this.len = this.horiz ? e : a, this.pos = this.horiz ? c : f
        }, toColor: function (a, b) {
            var c, f = this.stops, e, l = this.dataClasses, g, d;
            if (l)for (d = l.length; d--;) {
                if (g = l[d], e = g.from, f = g.to, (e === void 0 || a >= e) && (f === void 0 || a <= f)) {
                    c = g.color;
                    if (b)b.dataClass = d;
                    break
                }
            } else {
                this.isLog && (a = this.val2lin(a));
                c = 1 - (this.max - a) / (this.max - this.min || 1);
                for (d = f.length; d--;)if (c > f[d][0])break;
                e = f[d] || f[d +
                    1];
                f = f[d + 1] || e;
                c = 1 - (f[0] - c) / (f[0] - e[0] || 1);
                c = this.tweenColors(e.color, f.color, c)
            }
            return c
        }, getOffset: function () {
            var a = this.legendGroup, b = this.chart.axisOffset[this.side];
            if (a) {
                this.axisParent = a;
                m.prototype.getOffset.call(this);
                if (!this.added)this.added = !0, this.labelLeft = 0, this.labelRight = this.width;
                this.chart.axisOffset[this.side] = b
            }
        }, setLegendColor: function () {
            var a, b = this.options, c = this.reversed;
            a = c ? 1 : 0;
            c = c ? 0 : 1;
            a = this.horiz ? [a, 0, c, 0] : [0, c, 0, a];
            this.legendColor = {
                linearGradient: {
                    x1: a[0], y1: a[1], x2: a[2],
                    y2: a[3]
                }, stops: b.stops || [[0, b.minColor], [1, b.maxColor]]
            }
        }, drawLegendSymbol: function (a, b) {
            var c = a.padding, f = a.options, e = this.horiz, d = k(f.symbolWidth, e ? 200 : 12), g = k(f.symbolHeight, e ? 12 : 200), h = k(f.labelPadding, e ? 16 : 30), f = k(f.itemDistance, 10);
            this.setLegendColor();
            b.legendSymbol = this.chart.renderer.rect(0, a.baseline - 11, d, g).attr({zIndex: 1}).add(b.legendGroup);
            this.legendItemWidth = d + c + (e ? f : h);
            this.legendItemHeight = g + c + (e ? h : 0)
        }, setState: n, visible: !0, setVisible: n, getSeriesExtremes: function () {
            var a;
            if (this.series.length)a =
                this.series[0], this.dataMin = a.valueMin, this.dataMax = a.valueMax
        }, drawCrosshair: function (a, b) {
            var c = b && b.plotX, f = b && b.plotY, e, d = this.pos, g = this.len;
            if (b)e = this.toPixels(b[b.series.colorKey]), e < d ? e = d - 2 : e > d + g && (e = d + g + 2), b.plotX = e, b.plotY = this.len - e, m.prototype.drawCrosshair.call(this, a, b), b.plotX = c, b.plotY = f, this.cross && this.cross.attr({fill: this.crosshair.color}).add(this.legendGroup)
        }, getPlotLinePath: function (a, b, c, f, e) {
            return z(e) ? this.horiz ? ["M", e - 4, this.top - 6, "L", e + 4, this.top - 6, e, this.top, "Z"] : ["M",
                this.left, e, "L", this.left - 6, e + 6, this.left - 6, e - 6, "Z"] : m.prototype.getPlotLinePath.call(this, a, b, c, f)
        }, update: function (a, b) {
            var c = this.chart, f = c.legend;
            h(this.series, function (a) {
                a.isDirtyData = !0
            });
            if (a.dataClasses && f.allItems)h(f.allItems, function (a) {
                a.isDataClass && a.legendGroup.destroy()
            }), c.isDirtyLegend = !0;
            c.options[this.coll] = j(this.userOptions, a);
            m.prototype.update.call(this, a, b);
            this.legendItem && (this.setLegendColor(), f.colorizeItem(this, !0))
        }, getDataClassLegendSymbols: function () {
            var a = this, b =
                this.chart, c = this.legendItems, f = b.options.legend, e = f.valueDecimals, l = f.valueSuffix || "", g;
            c.length || h(this.dataClasses, function (f, m) {
                var i = !0, j = f.from, k = f.to;
                g = "";
                j === void 0 ? g = "< " : k === void 0 && (g = "> ");
                j !== void 0 && (g += d.numberFormat(j, e) + l);
                j !== void 0 && k !== void 0 && (g += " - ");
                k !== void 0 && (g += d.numberFormat(k, e) + l);
                c.push(r({
                    chart: b,
                    name: g,
                    options: {},
                    drawLegendSymbol: s.drawRectangle,
                    visible: !0,
                    setState: n,
                    isDataClass: !0,
                    setVisible: function () {
                        i = this.visible = !i;
                        h(a.series, function (a) {
                            h(a.points, function (a) {
                                a.dataClass ===
                                m && a.setVisible(i)
                            })
                        });
                        b.legend.colorizeItem(this, i)
                    }
                }, f))
            });
            return c
        }, name: ""
    });
    h(["fill", "stroke"], function (a) {
        d.Fx.prototype[a + "Setter"] = function () {
            this.elem.attr(a, p.prototype.tweenColors(i(this.start), i(this.end), this.pos))
        }
    });
    w(q.prototype, "getAxes", function (a) {
        var b = this.options.colorAxis;
        a.call(this);
        this.colorAxis = [];
        b && new p(this, b)
    });
    w(x.prototype, "getAllItems", function (a) {
        var b = [], c = this.chart.colorAxis[0];
        c && (c.options.dataClasses ? b = b.concat(c.getDataClassLegendSymbols()) : b.push(c), h(c.series,
            function (a) {
                a.options.showInLegend = !1
            }));
        return b.concat(a.call(this))
    });
    q = {
        pointAttrToOptions: {
            stroke: "borderColor",
            "stroke-width": "borderWidth",
            fill: "color",
            dashstyle: "dashStyle"
        },
        pointArrayMap: ["value"],
        axisTypes: ["xAxis", "yAxis", "colorAxis"],
        optionalAxis: "colorAxis",
        trackerGroups: ["group", "markerGroup", "dataLabelsGroup"],
        getSymbol: n,
        parallelArrays: ["x", "y", "value"],
        colorKey: "value",
        translateColors: function () {
            var a = this, b = this.options.nullColor, c = this.colorAxis, f = this.colorKey;
            h(this.data, function (e) {
                var d =
                    e[f];
                if (d = e.options.color || (d === null ? b : c && d !== void 0 ? c.toColor(d, e) : e.color || a.color))e.color = d
            })
        }
    };
    u.plotOptions.heatmap = j(u.plotOptions.scatter, {
        animation: !1,
        borderWidth: 0,
        nullColor: "#F8F8F8",
        dataLabels: {
            formatter: function () {
                return this.point.value
            }, inside: !0, verticalAlign: "middle", crop: !1, overflow: !1, padding: 0
        },
        marker: null,
        pointRange: null,
        tooltip: {pointFormat: "{point.x}, {point.y}: {point.value}<br/>"},
        states: {normal: {animation: !0}, hover: {halo: !1, brightness: 0.2}}
    });
    o.heatmap = v(o.scatter, j(q, {
        type: "heatmap",
        pointArrayMap: ["y", "value"],
        hasPointSpecificOptions: !0,
        pointClass: v(y, {
            setVisible: function (a) {
                var b = this, c = a ? "show" : "hide";
                h(["graphic", "dataLabel"], function (a) {
                    if (b[a])b[a][c]()
                })
            }
        }),
        supportsDrilldown: !0,
        getExtremesFromAll: !0,
        directTouch: !0,
        init: function () {
            var a;
            o.scatter.prototype.init.apply(this, arguments);
            a = this.options;
            a.pointRange = k(a.pointRange, a.colsize || 1);
            this.yAxis.axisPointRange = a.rowsize || 1
        },
        translate: function () {
            var a = this.options, b = this.xAxis, c = this.yAxis, f = function (a, b, c) {
                return Math.min(Math.max(b,
                    a), c)
            };
            this.generatePoints();
            h(this.points, function (e) {
                var d = (a.colsize || 1) / 2, g = (a.rowsize || 1) / 2, h = f(Math.round(b.len - b.translate(e.x - d, 0, 1, 0, 1)), -b.len, 2 * b.len), d = f(Math.round(b.len - b.translate(e.x + d, 0, 1, 0, 1)), -b.len, 2 * b.len), i = f(Math.round(c.translate(e.y - g, 0, 1, 0, 1)), -c.len, 2 * c.len), g = f(Math.round(c.translate(e.y + g, 0, 1, 0, 1)), -c.len, 2 * c.len);
                e.plotX = e.clientX = (h + d) / 2;
                e.plotY = (i + g) / 2;
                e.shapeType = "rect";
                e.shapeArgs = {x: Math.min(h, d), y: Math.min(i, g), width: Math.abs(d - h), height: Math.abs(g - i)}
            });
            this.translateColors();
            this.chart.hasRendered && h(this.points, function (a) {
                a.shapeArgs.fill = a.options.color || a.color
            })
        },
        drawPoints: o.column.prototype.drawPoints,
        animate: n,
        getBox: n,
        drawLegendSymbol: s.drawRectangle,
        alignDataLabel: o.column.prototype.alignDataLabel,
        getExtremes: function () {
            t.prototype.getExtremes.call(this, this.valueData);
            this.valueMin = this.dataMin;
            this.valueMax = this.dataMax;
            t.prototype.getExtremes.call(this)
        }
    }))
});
