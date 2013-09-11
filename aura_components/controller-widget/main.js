define(['underscore','backbone','text!./controller.tmpl',
  'text!../config.json'], 
  function(_,Backbone,template,config) {
    
  return {
    type: 'Backbone',
    events: {
      "click #btnsettext":"settext",
      "click #btnsave":"savetag"
    },      
    filtertagset:function(markups) {
      var out=[];
      var tagset=this.model.get("tagset");
      var tagnames=tagset.map(function(item){return item.name});
      for (var i=0;i<markups.length;i++) {
        if (tagnames.indexOf(markups[i].tag)>-1) {
          out.push(markups[i])
        }
      }
      return out;
    },
    savetag:function() {
      var that=this;
      var start=this.model.get("start");
      this.sandbox.emit("markable.getmarkups",function(newmarkups,removed){
        var tosave=that.filtertagset(newmarkups);
        var removed=that.filtertagset(removed);
        var obj={db:config.db,author:config.login,role:config.role,
        start:start,markups:tosave,removed:removed};
        that.sandbox.refinery.save(obj,function(err,data){
          var $btn=that.$el.find("#btnsave");
          var old=$btn.html();
          $btn.html("Saved!");
          setTimeout( function(){$btn.html(old)},2000);
        });
      });
    },
    loadtag:function(role,login) {
      var that=this;
      var start=this.model.get("start");
      var obj={db:config.db,author:login,role:role,selector:"pb[id="+start+"]"};
      that.sandbox.refinery.load(obj,function(err,data){
          for (var i=0;i<data.markups.length;i++) {
            data.markups[i].fromdisk=true;
          }
          that.sandbox.emit("markable.setmarkups",data.markups);
          that.$el.find("#message").html("loaded ");
      });
    },
    settext:function() {
      var that=this;
      var pb=$("#inputpb").val();
      var opts={db:config.db,tag:"pb",attribute:"id",
      value:pb,addbr:true,slottag:true,tokentag:true,extraslot:1};
      this.sandbox.yase.getTextByTag(opts,function(err,data) {
        that.sandbox.emit('markable.settext',"markable1",data.text)  ;
        that.model.set("start",pb);
        //load others
        var tagsetmerge=that.model.get("tagsetmerge");
        for (var i in tagsetmerge) that.loadtag(tagsetmerge[i]);
        that.loadtag(config.role,config.login);
      })
      
    },
    settagset:function(tagset) {
      this.model.set("tagset",tagset);
    },
    settagsetmerge:function(tagset) {
      this.model.set("tagsetmerge",tagset);
    },
    render:function() {
      this.html( _.template(template,{}));
    },
    initialize: function() {
      try {
        config=JSON.parse(config);  
      } catch(err) {
        bootbox.alert(err+" <br/> when parsing config.json");
      }
      this.model=new Backbone.Model();
      this.render();
      this.sandbox.on("tagset",this.settagset,this);
      this.sandbox.on("tagset-merge",this.settagsetmerge,this);
      setTimeout( _.bind(this.settext,this) , 500);
    }
  };
});
