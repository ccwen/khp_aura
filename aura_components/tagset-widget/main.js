define(['underscore','text!./tagset.tmpl','text!../config.json'],
 function(_,template,config) {
  config=JSON.parse(config);
  return {
    type: 'Backbone',
    events: {
    "click #tagset input[type=radio]":"tagchosen",
    },
    tagchosen:function(e) {
      var span=$(e.target.nextSibling);
      var tag=span.html();
      var tagset=this.model.get("tagset");
      var taginfo=_.find(tagset.tags,function(obj){return obj.name==tag});
      this.model.set({"tag":tag,"taginfo":taginfo});
    },    
    render:function() {
      this.loadtagset();
    },
    settag:function() {
      var tag=this.model.get("tag");
      var taginfo=this.model.get("taginfo");
      this.sandbox.emit("markable.settag",tag,taginfo);
    },
    createstylesheet:function(tagset){
      var sheet = document.styleSheets[0];
      for (var i in tagset.tags) {
        var taginfo=tagset.tags[i];
        sheet.addRule("."+taginfo.name,taginfo.style);
        if (taginfo.data) {
          if (taginfo.afterstyle) sheet.addRule("."+taginfo.name+":after",taginfo.afterstyle)
          if (taginfo.beforestyle) sheet.addRule("."+taginfo.name+":before",taginfo.beforestyle)
        }

      }
    },
    loadtagset:function() {
      var that=this;
      requirejs(['text!./tagset/'+config.role+'.json'],function(data) {
        var tagset=JSON.parse(data);
        that.model.set("tagset",tagset);
        that.$el.html(_.template(template,tagset));
        that.model.set("tag",$("#tagset input[checked]").next().html());
        that.createstylesheet(tagset);
      });
    },
    model:new Backbone.Model(),
    initialize: function() {
      this.render();
      this.model.on("change:tag",_.bind(this.settag,this));
    }
  };
});
