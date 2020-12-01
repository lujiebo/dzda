sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/ui/core/UIComponent"
], function (Controller, History, UIComponent) {
  "use strict";

  return Controller.extend("com.shunyu.dzda.controller.BaseController", {
    /**
     * Convenience method for getting the view model by name in every controller of the application.
     * @public
     * @param {string} sName the model name
     * @returns {sap.ui.model.Model} the model instance
     */
    getModel: function (sName) {
      return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
    },

    /**
     * Convenience method for setting the view model in every controller of the application.
     * @public
     * @param {sap.ui.model.Model} oModel the model instance
     * @param {string} sName the model name
     * @returns {sap.ui.mvc.View} the view instance
     */
    setModel: function (oModel, sName) {
      return this.getView().setModel(oModel, sName);
    },

    /**
     * Convenience method for getting the resource bundle.
     * @public
     * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
     */
    getResourceBundle: function () {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },

    /**
     * Method for navigation to specific view
     * @public
     * @param {string} psTarget Parameter containing the string for the target navigation
     * @param {mapping} pmParameters? Parameters for navigation
     * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
     */
    navTo: function (psTarget, pmParameters, pbReplace) {
      this.getRouter().navTo(psTarget, pmParameters, pbReplace);
    },

    getRouter: function () {
      return UIComponent.getRouterFor(this);
    },

    getI18NText: function (sKey, aPlaceHolder) {
      var oResourceBundle = this.getResourceBundle();
      return oResourceBundle.getText(sKey, aPlaceHolder);
    },

    onNavToHome: function () {
      this.getOwnerComponent().getScheduleCenter().shutdown();
      this.getRouter().navTo("Home");
    },
    onNavBack: function () {
      this.navBack();
    },
    navBack: function () {
      var oHistory, sPreviousHash;
      oHistory = History.getInstance();
      sPreviousHash = oHistory.getPreviousHash();
      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getRouter().navTo("Home", {}, true /*no history*/ );
      }
    },
    openBusyDialog: function (oEvent) {
      // BusyDialog
      if (!this.oBusyDialog) {
        this.oBusyDialog = this.byId("BusyDialog");
      }
      this.oBusyDialog.setVisible(true);
      this.oBusyDialog.open();
    },
    // 获取fcode，即为id
    getfcode: function (oEvent, num) {
      if (num == undefined) {
        var sButId = oEvent.getParameter("id");
        var aButId = sButId.split("-");
        var iLast = parseInt(aButId.length) - 1;
        var sOP = aButId[iLast];
        return sOP;
      } else {
        var sButId = oEvent.getParameter("id");
        var aButId = sButId.split("-");
        var iLast = parseInt(aButId.length) - num;
        var sOP = aButId[iLast];
        return sOP;
      }
    },
    setBusy: function(b) {
			this.getModel().setProperty("/appProperties/busy", b);
		},
		createFileTable: function(oEvent) {
			var FileTable = [{
				FileType: '01',
				FileDesc: '身份证复印件'
			}, {
				FileType: '02',
				FileDesc: '毕业证复印件'
			}, {
				FileType: '03',
				FileDesc: '学位证复印件'
			}, {
				FileType: '04',
				FileDesc: '上家单位离职证明'
			}, {
				FileType: '05',
				FileDesc: '白底证件照片'
			}, {
				FileType: '06',
				FileDesc: '体检报告'
			}];
			return FileTable;
		}
  });

});