define(['underscore','backbone','aem',
'text!./markable.tmpl'], 
  function(_,Backbone,aem,template) {
  return {
    type: 'Backbone',
    events: {
      "click tk":"clickdomnode",
    },
    vposfromdomnode:function(tk) {
      var token=tk.attributes['n'].value;
      var slot=tk.parentNode.attributes['n'].value;
      return parseInt(slot)*4096+parseInt(token) ;
    },
    domnodefromvpos:function(vpos) {
        var slot=Math.floor(vpos /4096);
        var $slot=this.slot2dom[slot];
        if (!$slot) $slot=this.slot2dom[slot]=this.$el.find('slot[n='+slot+']');
        return $slot.find('tk[n='+vpos %4096+']');
    },
    clickdomnode: function(e) {
      if (this.readonly) return;
      var $tk=this.$el.find(e.target), $slot=$tk.parent(); 
      this.toggletag($tk);
    },    
    settext:function(id,text) {
      if (id!=this.id) return;
      this.html(_.template(template,{text:text}));
    },
    setselectable:function() {
      this.readonly=false;
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
    toggletag:function(selected) {
      var vpos=this.vposfromdomnode(selected[0]);
      var tag=this.model.get('tag');
      var m=this.aemCollection.findWhere({tagname:tag,vpos:vpos});
      if (m) this.removeaem(m);
      else this.addtag(selected);
    },
    addtag:function(selected) {
      if (!selected) return ;
      var that=this;
      var vpos=this.vposfromdomnode(selected[0]);
      var tag=this.model.get('tag');
      var taginfo=this.model.get('taginfo');
      if (taginfo&&taginfo.data) {
        bootbox.prompt('input '+taginfo.data+' for '+selected.html(),function(result){
          if (result) {
            var extra={};
            extra[taginfo.data]=result;
            that.aemCollection.add({id:tag+vpos,vpos:vpos, tagname:tag, extra: extra})
          }
        });
      } else {
        this.aemCollection.add({id:tag+vpos,vpos:vpos, tagname:tag })
      }
    },
    clearaem:function() {
      this.$el.find("tk").removeClass();
    },
    renderaem:function() {
      this.clearaem();
      var C=this.aemCollection.models;
      for (var i in C){
        this.newaem(C[i]);
      }
    },
    removeaem:function(m) {
      var vpos=m.get("vpos");
      var node=this.domnodefromvpos(vpos);
      var tag=node.attr("class");
      node.removeClass();
      this.aemCollection.remove(m)
    },
    newaem:function(m) {
      var node=this.domnodefromvpos(m.get("vpos"));
      if (!node) return;
      var tag=m.get("tagname");
      node.addClass(m.get("tagname"));  
      var extra=m.get("extra");
      for (var i in extra) {
        node.attr('data-'+tag+'-'+i,extra[i]);
      }
    },
    settag:function(tag,taginfo) {
      this.model.set("tag",tag);
      this.model.set("taginfo",taginfo);
    },
    initialize: function() {
      this.readonly=false;
      this.model=new Backbone.Model();
      this.slot2dom={}; //for speed up tokenfromvpos
      this.setheight();
      this.id=this.options.id;
      this.aemCollection=new aem.AEMCollection();
      this.aemCollection.on("remove",this.removeaem,this);
      this.aemCollection.on("add",this.newaem,this);
      this.aemCollection.on("reset",this.renderaem,this);
      this.sandbox.on("parallel.setselectable",this.setselectable,this);
      this.sandbox.on('markable.settext',this.settext,this);
      this.sandbox.on('markable.settag',this.settag,this);
      this.model.on("change:tag",this.tagchanged,this);
    }
  };
});