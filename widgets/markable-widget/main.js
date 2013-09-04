define(['underscore','backbone',
'text!./markable.tmpl'], 
  function(_,Backbone,template) {
  return {
    type: 'Backbone',
    events: {
      "click tk":"clicktoken",

      "mousemove tk":"mousemove"
    },

    vposfromtoken:function(tk) {
      var token=tk.attributes['n'].value;
      var slot=tk.parentNode.attributes['n'].value;
      return parseInt(slot)*4096+parseInt(token) ;
    },
    tokenfromvpos:function(vpos) {
        var slot=Math.floor(vpos /4096);
        var $slot=this.slot2dom[slot];
        if (!$slot) $slot=this.slot2dom[slot]=this.$el.find('slot[n='+slot+']');
        return $slot.find('tk[n='+vpos %4096+']');
    },
    mousemove:function(e) {
      if (e.target.nodeName!='TK') return;
      var vpos=this.vposfromtoken(e.target);
      if (vpos==this.lastvpos) return;
      this.lastvpos=vpos;
    },
    tillendofsentence:function($tk) {
      var o="";
      var tk=$tk[0];
      while (tk) {
        if (tk.nodeType==3) o+=tk.textContent;
        else o+=tk.innerHTML;
        tk=tk.nextSibling;
      }
      return o.replace(/<.*?>/g,'');
    },
    clicktoken: function(e) {
      if (this.readonly) return;
      var $tk=this.$el.find(e.target), $slot=$tk.parent(); 
      
      var vpos=this.vposfromtoken(e.target);
      
      var tag=this.model.get("tag");
      var that=this;
      if ($tk.hasClass(tag)) {
        this.removetag(function() {
          $tk.removeClass();
          that.model.set("selected",null);
        });
      } else {
        $tk.removeClass(); 
        this.model.set("selected",$tk);        
        this.addtag();
      }
    },    
    settext:function(id,text) {
      if (id!=this.id) return;
      this.html(_.template(template,{text:text}));
    },
    setselectable:function() {
      this.readonly=false;
    },
    loadparallel:function() {
      if (this.options.load) this.sandbox.emit('parallel.load',this.db, this.start);
    },
    setheight:function() {
      var screenheight=parseInt($(".mainview").css('height'),10)-parseInt($("#controlpanel").css('height'),10);
      this.$el.css("height",screenheight+'px');
    }, 
    tagdataattributes:function(ele, tag) {
      var attrs=[];
      for (var i=0;i<ele[0].attributes.length;i++) {
        var attrname=ele[0].attributes[i].name;
        var prefix='data-'+tag;
        if (attrname.substring(0,prefix.length)==prefix) attrs.push(attrname);
      }
      return attrs;
    },
    removetag:function(callback) {
      var selected=this.model.get("selected");
      if (!selected) return ;
      var cls=selected.attr('class');
      var attrs=this.tagdataattributes(selected,cls);
      if (attrs.length) {
        bootbox.confirm('Remove <span class="'+cls+'">'+cls+
          "</span> with attribute:<b>"
          +selected.attr(attrs[0])+"</b>?",function(res){
          if (res) {
            callback();
          }
        })
      } else {
        callback();
      }
    },
    addtag:function() {
      var selected=this.model.get("selected");
      if (!selected) return ;
      var tag=this.model.get('tag');
      var taginfo=this.model.get('taginfo');

      if (taginfo&&taginfo.data) {
        bootbox.prompt('input '+taginfo.data,function(result){
          if (result) {
            selected.addClass(tag);
            selected.attr('data-'+tag+'-'+taginfo.data,result);
          }
        });
      } else {
        selected.addClass(tag);
      }
        

    },
    model:new Backbone.Model(),
    tagchanged:function() {
      //this.removetag();
      //this.addtag();
    },
    settag:function(tag,taginfo) {
      this.model.set("tag",tag);
      this.model.set("taginfo",taginfo);
    },
    initialize: function() {
      this.readonly=false;
      this.slot2dom={}; //for speed up tokenfromvpos
      this.setheight();
      this.id=this.options.id;
      this.sandbox.on("parallel.setselectable",this.setselectable,this);
      this.sandbox.on('markable.settext',this.settext,this)
      this.sandbox.on('markable.settag',this.settag,this)
      this.model.on("change:tag",this.tagchanged,this);
      this.loadparallel();      
    }
  };
});