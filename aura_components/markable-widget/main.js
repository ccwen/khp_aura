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

    taghasattr:function($tk) {
      return (m && m.get("extra"));
    },
    clickdomnode: function(e) {
      if (this.readonly) return;
      var that=this;
      var $tk=this.$el.find(e.target), $slot=$tk.parent();
      var vpos=this.vposfromdomnode($tk[0]);
      var m=this.aemCollection.findWhere({vpos:vpos});
      if (m&&m.get("extra")) {
        var extra=m.get("extra");
        var field=Object.keys(extra)[0];
        bootbox.prompt({
          title:'modify '+field+' for '+$tk.html()+' ,cancel to remove',value:extra[field],
          callback:function(result){
            if (result) {
              extra[field]=result;
              m.set("extra",extra);       
              that.updatedomnode($tk,m);  
            } else that.removeaem(m);
          }
        });
      } else {
        this.toggletag($tk);  
      }
      
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
      var m=this.aemCollection.findWhere({tag:tag,vpos:vpos});
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
            that.aemCollection.add({id:vpos+tag,vpos:vpos, tag:tag, extra: extra})
          }
        });
      } else {
        this.aemCollection.add({id:vpos+tag,vpos:vpos, tag:tag })
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
      if (m.get("fromdisk")) {
        this.removedCollection.add({id:m.get("id")});
      }
      node.removeClass();
      this.aemCollection.remove(m)
    },
    updatedomnode:function(node,model) {
      var extra=model.get("extra");
      var tag=model.get("tag");
      for (var i in extra) {
        node.attr('data-'+tag+'-'+i,extra[i]);
      }
    },
    newaem:function(m) {
      var node=this.domnodefromvpos(m.get("vpos"));
      if (!node) return;
      var tag=m.get("tag");
      node.addClass(m.get("tag"));
      this.updatedomnode(node,m);
    },
    settag:function(tag,taginfo) {
      this.model.set("tag",tag);
      this.model.set("taginfo",taginfo);
    },
    getmarkups:function(callback) {
      callback(this.aemCollection.toJSON(),this.removedCollection.toJSON());
    },
    setmarkups:function(markups) {
      this.aemCollection.reset(markups);
    },    
    createcollection:function() {
      this.aemCollection=new aem.AEMCollection();
      this.aemCollection.on("remove",this.removeaem,this);
      this.aemCollection.on("add",this.newaem,this);
      this.aemCollection.on("reset",this.renderaem,this);

      this.removedCollection=new Backbone.Collection();
    },
    initialize: function() {
      this.readonly=false;
      this.model=new Backbone.Model();
      this.slot2dom={}; //for speed up tokenfromvpos
      this.setheight();
      this.createcollection();
      this.id=this.options.id;
      this.sandbox.on("parallel.setselectable",this.setselectable,this);
      this.sandbox.on('markable.settext',this.settext,this);
      this.sandbox.on('markable.settag',this.settag,this);
      this.sandbox.on('markable.getmarkups',this.getmarkups,this);
      this.sandbox.on('markable.setmarkups',this.setmarkups,this);
      this.model.on("change:tag",this.tagchanged,this);
    }
  };
});