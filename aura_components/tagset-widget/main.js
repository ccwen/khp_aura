define(['underscore','text!./tagset.tmpl','text!../config.json'],
 function(_,template,config) {
  
  return {
    type: 'Backbone',
    events: {
    "click #tagset input[type=radio]":"tagchosen",
    },
    tagchosen:function(e) {
      var span=$(e.target.nextSibling);
      var tag=span.text();
      this.model.set({"tag":tag});
    },    
    render:function() {
      this.loadtagset();
    },
    settag:function() {
      var tag=this.model.get("tag");
      var tagset=this.model.get("tagset");
      var taginfo=_.find(tagset.tags,function(obj){return obj.name==tag});
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
        try {
          var tagset=JSON.parse(data);  
        } catch(err) {
          bootbox.alert(err+" <br/> when parsing "+config.role+'.json');
        }
        
        that.model.set("tagset",tagset);
        that.sandbox.emit("tagset",tagset.tags);
        that.$el.html(_.template(template,tagset));
        that.model.set("tag",$("#tagset input[checked]").attr("tagname"));
        that.createstylesheet(tagset);

        if (typeof tagset.merge=='string') tagset.merge=[config.merge];
        that.sandbox.emit("tagset-merge",tagset.merge);
        for (var i in tagset.merge) {
          requirejs(['text!./tagset/'+tagset.merge[i]+'.json'],function(data) {
            var merge=JSON.parse(data);
            that.createstylesheet(merge);
          });
        }

      });

    },
    model:new Backbone.Model(),
    initialize: function() {
      try {
        config=JSON.parse(config);  
      } catch(err) {
        bootbox.alert(err+" <br/> when parsing config.json");
      }
      
      this.model.on("change:tag",_.bind(this.settag,this));
      this.render();
    }
  };
});
