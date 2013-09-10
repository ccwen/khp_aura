define(['underscore','backbone','text!./controller.tmpl',
  'text!../config.json'], 
  function(_,Backbone,template,config) {
    config=JSON.parse(config);
  return {
    type: 'Backbone',
    events: {
      "click #btnsettext":"settext",
      "click #btnsave":"savetag"
    },      
    savetag:function() {
      var that=this;
      var start=this.model.get("start");
      this.sandbox.emit("markable.getmarkups",function(data){
        var obj={db:config.db,author:'yap',start:start,markups:data};
        that.sandbox.refinery.save(obj,function(err,data){
          that.$el.find("#message").html("saved "+JSON.stringify(data));
        });
      });
    },
    loadtag:function() {
      var that=this;
      var start=this.model.get("start");
      var obj={db:config.db,author:'yap',start:start};
      that.sandbox.refinery.load(obj,function(err,data){
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
      })
      
    },
    render:function() {
      this.html( _.template(template,{}));
    },
    initialize: function() {
      console.log(config);
      this.model=new Backbone.Model();
      this.render();
      setTimeout( _.bind(this.settext,this) , 500);
    }
  };
});
