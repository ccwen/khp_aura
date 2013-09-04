define(['underscore','text!./controller.tmpl'], function(_,template) {
  return {
    type: 'Backbone',
    events: {
      "click #btnsettext":"settext",
     
    },      

    settext:function() {
      var that=this;
      var pb=$("#inputpb").val();
      var opts={db:"jiangkangyur",tag:"pb",attribute:"id",
      value:pb,addbr:true,slottag:true,tokentag:true,extraslot:1};
      this.sandbox.yase.getTextByTag(opts,function(err,data) {
        that.sandbox.emit('markable.settext',"markable1",data.text)  ;
      })
      
    },
    render:function() {
      this.html( _.template(template,{}));
    },
    initialize: function() {
      this.render();
      setTimeout( _.bind(this.settext,this) , 500);
    }
  };
});
