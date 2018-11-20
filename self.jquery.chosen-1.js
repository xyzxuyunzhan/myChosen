(function($){
    //要做集合的遍历处理--可暂时不做，先做id选择器
    $.fn.extend({
        myChosen:function(param){
            return new MyChosen(param,$(this));
        },
        getMyChosenData:function(){
            var data={};
            var values=[];
            var names=[];
            $(this).next().find(".select-choices .search-choice").each(function(){
                values.push($(this).find("input").val());
                names.push($(this).find("span").text());
            });
            data.values=values;
            data.names=names.toString();
            return data;
        }
    });
    var MyChosen=function(param,obj){
        this.defaults={
            showCount:50,//默认加载50条数据
            width:"76%",
            searchTip:"请选择",
            obj: obj,
            ajax:{
                type:"POST",
                url:"",
                dataType: "json",
                param: !1,
                async: !0,
                cache: !1,
                timeout: 5000,
                ajaxStart: function(){ return false;},
                ajaxStop: function(){ return false;},
                callback: function(){ return false;}
            }
        };
        $.extend(!0,this.defaults,param);
        (obj.attr('disabled') == 'disabled'||obj.attr('disabled') == true)?(this.initHtml='<div class="multiple-select-container select_disabled" style="width:'+ this.defaults.width+'"><ul class="select-choices"><li class="search-field"><input type="text" value="'+this.defaults.searchTip+'" autocomplete="off" class="default" disabled="disabled"></li></ul><div class="select-drop"><ul class="select-results"></ul></div></div>')
            : (this.initHtml='<div class="multiple-select-container" style="width:'+ this.defaults.width+'"><ul class="select-choices"><li class="search-field"><input type="text" value="'+this.defaults.searchTip+'" autocomplete="off" class="default"></li></ul><div class="select-drop"><ul class="select-results"></ul></div></div>');
        this.init(obj);
        this.inputValue="";
    };
    MyChosen.prototype={
        init:function(obj){
            obj.hide();//掩藏原有select
            $(this.initHtml).insertAfter(obj);
            obj.data("selectData",this);
            obj.parent().find(".search-field input[type='text']").css({"width":this.getInputValueLength(this.defaults.searchTip)});
        },
        getParam:function(){
            return this.defaults.ajax.param && ("showCount="+this.defaults.showCount+"&"+this.defaults.ajax.param+"="+this.inputValue);
        },
        ajax:function(opts){
            var _this = this;
            $.ajax({
                url: opts.ajax.url,
                type: opts.ajax.type,
                data: this.getParam(),//解决中文传输问题
                contentType: "application/x-www-form-urlencoded;utf-8",
                async: opts.ajax.async,
                cache: opts.ajax.cache,
                timeout: opts.ajax.timeout,
                error: function() {
                    //请求失败
                },
                success: function(a) {
                    opts.ajax.ajaxStop();
                    opts.ajax.callback(a);
                    $(document).trigger("myFocus.myChosen", _this.defaults.obj.next().find(".select-choices"));
                }
            });
        },
        hideAjaxResults:function(a){//ajax结果掩藏
            a.removeClass("multiple-select-container-active");
            a.find(".select-drop").css({"left":"-9999px"});
            a.find(".highlighted:last").removeClass("highlighted");
        },
        showAjaxResults:function(a){//ajax结果显示
            a.addClass("multiple-select-container-active");
            a.find(".active-result:first").addClass("highlighted");
            a.find(".select-drop").css({"left":"0px"});
            this.scroll_position(a);
        },
        scroll_position:function(a){//上下键位置定位
            var search_results=a.find(".select-drop .select-results");
            var height=search_results.height();
            var visible_top = search_results.scrollTop();
            var maxHeight = parseInt(search_results.css("maxHeight"), 10);
            var visible_bottom = maxHeight + visible_top;
            if(a.find(".highlighted").length>0){
                var high_top=a.find(".highlighted").position().top+search_results.scrollTop();
                var high_bottom = high_top + a.find(".highlighted").outerHeight();
                if (high_bottom >= visible_bottom) {
                    return search_results.scrollTop((high_bottom - maxHeight) > 0 ? high_bottom - maxHeight : 0);
                } else if (high_top < visible_top) {
                    return search_results.scrollTop(high_top);
                }
            }
        },
        keyup_arrow:function(a){
            if(a.find(".highlighted").prevAll(".active-result:first").length>0){
                a.find(".highlighted").prevAll(".active-result:first").addClass("highlighted");
                a.find(".highlighted:last").removeClass("highlighted");
                this.scroll_position(a);
            }else{
                this.hideAjaxResults(a);
            }
        },
        keydown_arrow:function(a){
            a.find(".select-drop").css({"left":"0px"});
            if(a.find(".highlighted").length>0){
                if(a.find(".highlighted").nextAll(".active-result:first").length>0){
                    a.find(".highlighted").nextAll(".active-result:first").addClass("highlighted");
                    a.find(".highlighted:first").removeClass("highlighted");
                }
            }else{
                a.find(".active-result:first").addClass("highlighted");
            }
            this.scroll_position(a);
        },
        keydown_right:function(a){
            if(a.find(".highlighted").length>0){
                var select_text=a.find(".highlighted").text();
                var select_value=a.find(".highlighted").find("input").attr("id");
                a.find(".highlighted").attr("class","result-selected");
                a.find(".select-choices .search-field").before("<li class=\"search-choice\"><span>"+select_text+"</span><input type=\"hidden\" value=\""+select_value+"\"><a class=\"search-choice-close\"></a></li>");
                a.find(".select-choices .search-field input[type='text']").focus();
                a.find(".select-choices .search-field input[type='text']").val("");
                if(a.prev().find("option[value='"+select_value+"']").length>0){
                    a.prev().find("option[value='"+select_value+"']").attr("selected","selected");
                }else{
                    a.prev().append('<option value="' + select_value + '" selected="selected">' + select_text + '</option>');
                }
                this.hideAjaxResults(a);
            }
        },
        keydown_back:function(a){
            if(a.find(".select-choices .search-field input[type='text']").val()==""){
                if(a.find(".select-choices .search-field input[type='text']").parent().prev().length>0){
                    a.find(".select-choices .search-field input[type='text']").parent().prev().find(".search-choice-close").click();
                    this.hideAjaxResults(a);
                }
            }
        },
        getInputValueLength:function(str){//计算字符串长度，调整输入框长度
            var reLen = 0;
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) < 27 || str.charCodeAt(i) > 126) {// 全角    中文
                    reLen += 2;
                } else {
                    reLen++;
                }
            }
            reLen=reLen*6+31;
            return reLen;
        }
    };
    $(function(){
        //点击事件判断
        $(document).on("click.myChosen",function(event) {
            var mySelect=$(".multiple-select-container-active");
            if(mySelect.length>0){
                var b=mySelect.prev().data("selectData");
                event=event?event:window.event;
                var search_results=mySelect.find(".select-drop .select-results");
                var maxHeight = parseInt(search_results.css("maxHeight"), 10);
                var width=parseInt(mySelect.css("width"),10);
                var left=mySelect.offset().left;
                var top=mySelect.offset().top;
                var height=mySelect.height();
                var rangX=left+width;
                var rangY=top+height+maxHeight;
                if(left<event.pageX&&event.pageX<rangX&&top<event.pageY&&event.pageY<rangY){
                    //console.log("显示");
                }else{
                    b.hideAjaxResults(mySelect);
                }
            }
        });
        //多选框点击事件，触发input焦点
        $(document).on("click.myChosen", ".multiple-select-container .select-choices",function(b) {
            if (!$(this).parents(".multiple-select-container").hasClass("select_disabled")) {
                b=$(this).parents(".multiple-select-container").prev().data("selectData");
                $(document).trigger("myFocus.myChosen",$(this));
            }
        });
        //输入框获得焦点
        $(document).off("myFocus.myChosen").on("myFocus.myChosen",function(b,a) {
            b=$(a).parents(".multiple-select-container").prev().data("selectData");
            var t=$(a).find(".search-field input[type='text']");
            if(t.val()==b.defaults.searchTip||t.val()==""){
                t.focus();
                t.removeClass("default").addClass("input_focus");
                t.val("");
            }
            b.showAjaxResults($(a).parents(".multiple-select-container"));
        });
        //输入框失去焦点
        $(document).on("blur.myChosen", ".multiple-select-container .select-choices .search-field input[type='text']",function(e) {
            var b=$(this).parents(".multiple-select-container").prev().data("selectData");
            if($(this).parent().prev().length<1){
                $(this).removeClass("input_focus").addClass("default");
                $(this).val(b.defaults.searchTip);
            }else{
                $(this).val("");
            }
            $(this).css({"width":b.getInputValueLength($(this).val())});
        });
        //输入框键盘事件
        $(document).on("keydown.myChosen", ".multiple-select-container .select-choices .search-field input[type='text']",function(e) {
            var b=$(this).parents(".multiple-select-container").prev().data("selectData");
            var a=$(this).parents(".multiple-select-container");
            $(this).css({"width":b.getInputValueLength($(this).val())});
            b.inputValue=$.trim($(this).val());
            if(e.which==13){
                b.ajax(b.defaults);//鼠标enter加载数据
            }else if(e.which==38){
                b.keyup_arrow(a);//鼠标向上，掩藏ajax结果和移动选中位置
            }else if(e.which==40){
                b.keydown_arrow(a);//鼠标向下，显示ajax结果和移动选中位置
            }else if(e.which==8){
                b.keydown_back(a);//按下backspace键，清除多选里面的值
            }else if(e.which==39){
                b.keydown_right(a);//右按键，选中下拉的值
            }
        });
        //删除多选框里的值
        $(document).on("click.myChosen", ".multiple-select-container .search-choice .search-choice-close",function(e) {
            var thisValremovepoint;
            if (!$(this).parents(".multiple-select-container").hasClass("select_disabled")) {
                var b=$(this).parents(".multiple-select-container").prev().data("selectData");
                var a=$(this).parents(".multiple-select-container");
                var t=a.find(".select-choices .search-field input[type='text']");
                $(this).closest("li").remove();
                if(a.find(".search-choice").length<1){
                    t.val("");
                    t.css({"width":b.getInputValueLength(t.val())});
                }
                thisValremovepoint=$(this).prev().val();
                a.prev().find("option[value='"+$(this).prev().val()+"']").attr("selected",false);
                $(".select-results .result-selected").each(function(){
                    if($(this).find("input").attr("id")==thisValremovepoint){
                        $(this).removeClass("result-selected").addClass("active-result");
                    }
                });
                // $("#"+$(this).prev().val()).parent().removeClass("result-selected").addClass("active-result");
                t.trigger("focus.myChosen");
                $(this).parents(".multiple-select-container").prev().change();
                //阻止冒泡，并掩藏下拉结果
                e=e?e:window.event;
                e.stopPropagation();//阻止冒泡
            }
        });
        //点击下拉可选内容
        $(document).on("click.myChosen", ".multiple-select-container .select-drop .select-results .highlighted",function(e) {
            var b=$(this).parents(".multiple-select-container").prev().data("selectData");
            var a=$(this).parents(".multiple-select-container");
            b.keydown_right(a);//右按键，选中下拉的值
            $(this).parents(".multiple-select-container").prev().change();
            //阻止冒泡，并掩藏下拉结果
            e=e?e:window.event;
            e.stopPropagation();//阻止冒泡
        });
        //下拉选项鼠标移动样式变化-mouseover
        $(document).on("mouseover.myChosen", ".multiple-select-container .select-drop .select-results .active-result",function(b) {
            $(this).addClass("highlighted");
        });
        //下拉选项鼠标移动样式变化-mouseout
        $(document).on("mouseout.myChosen", ".multiple-select-container .select-drop .select-results .active-result",function(b) {
            $(".highlighted").removeClass("highlighted");
            $(this).removeClass("highlighted");
        });
        //触发自定义select更新
        $(document).on("myChosen:updated.myChosen", function(e) {
            var s_obj=$("#"+e.target.id);
            var b=s_obj.data("selectData");
            var container=s_obj.next();
            (s_obj.attr('disabled') == 'disabled'||s_obj.attr('disabled') == true) ? container.addClass('select_disabled'):container.removeClass('select_disabled');
            container.find(".select-results").html("");
            container.find(".select-choices .search-choice").each(function(){
                var choice_value=$(this).find("input").val();
                //var choice_text=$(this).find("span").text();
                if(s_obj.find("option[value='"+choice_value+"']").length>0){
                    s_obj.find("option[value='"+choice_value+"']").attr("selected","selected");
                }/*else{
                 s_obj.append('<option value="' + choice_value + '" selected="selected">' + choice_text + '</option>');
                 }*/
            });
            s_obj.find("option").each(function(){
                if($(this).val()!=""&&$(this).val()!=null){
                    if($(this).is(":selected")){
                        container.find(".select-results").append("<li class=\"result-selected\"><span>"+$(this).text()+"</span><input type=\"hidden\" id=\""+$(this).val()+"\"></li>");
                        //container.find(".select-choices .search-field").before("<li class=\"search-choice\"><span>"+$(this).text()+"</span><input type=\"hidden\" value=\""+$(this).val()+"\"><a class=\"search-choice-close\"></a></li>");
                    }else{
                        container.find(".select-results").append("<li class=\"active-result\"><span>"+$(this).text()+"</span><input type=\"hidden\" id=\""+$(this).val()+"\"></li>");
                    }
                }
            });
            //s_obj.attr('disabled') == 'disabled' || b.showAjaxResults(container);
        });
        $(document).on("myChosen:init.myChosen", function(e,a,c) {
            var s_obj=$("#"+e.target.id);
            var b=s_obj.data("selectData");
            var container=s_obj.next();
            var arr = a.split(",");
            var length = arr.length;
            var value = "";
            var name_arr=c.split(",");
            var t=container.find(".select-choices .search-field input[type='text']");
            for (var i = 0; i < length; i++) {
                value = $.trim(arr[i]);//去空格
                if(value!=""){
                    s_obj.append("<option value='"+value+"' selected=\"selected\">"+name_arr[i]+"</option>");
                    t.parent().before("<li class=\"search-choice\"><span>"+name_arr[i]+"</span><input type=\"hidden\" value=\""+value+"\"><a class=\"search-choice-close\"></a></li>");
                    t.val("");
                    t.css({"width":b.getInputValueLength(t.val())});
                }
            }
        });
    });
})(jQuery);




















