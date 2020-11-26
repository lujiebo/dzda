sap.ui.define([
  "com/shunyu/dzda/controller/BaseController",
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/UIComponent",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/m/Dialog",
  "./searchHelp",
  "com/shunyu/dzda/model/models",
  "com/shunyu/dzda/model/Util",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter"
], function (BaseController,
  Controller,
  UIComponent,
  MessageBox,
  MessageToast,
  Dialog,
  searchHelp,
  models,
  Util,
  JSONModel,
  Filter) {
  "use strict";

  return BaseController.extend("com.shunyu.dzda.controller.Index", {
    _tagfilterbar: null,

    // 初始化
    onInit: function () {
      this.oDataModelZCommon = this.getOwnerComponent().getModel("ZCommon");
      this._ResourceBundle = this.getModel("i18n").getResourceBundle();
      this._JSONModel = this.getModel();

      var onSearchData = models._initialLocalData().onSearchData;
      this.setModel(new JSONModel(onSearchData), "onSearch");
      this.oRouter = UIComponent.getRouterFor(this);

      var gyzt = {
        list: [{
          "key": "3",
          "value": "在职"
        }]
      }
      var oSearchModel = new JSONModel(gyzt);
    },
    ShowMessage: function (oMessage) {
      if (oMessage != "") {
        MessageBox.error(oMessage, {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
    },
    // 执行按钮
    onSearch: function (oEvent) {
      var searchdata = this.getModel("onSearch").getData(),
        aFilterGroupsFilters = [],
        WerkFilters = [], //工厂过滤器
        FackFilters = [], // 发出仓库过滤器
        MaterialFilters = [], //物料编号过滤器
        MchbFilters = []; //批次过滤器

      if (!Util.isNotNull(searchdata.werks)) {
        MessageToast.show("请选择工厂!", {
          at: "center center"
        });
        return;
      }

      if (!Util.isNotNull(searchdata.stock)) {
        MessageToast.show("请选择库存地点!", {
          at: "center center"
        });
        return;
      }

      if (!Util.isNotNull(searchdata.Material)) {
        MessageToast.show("请选择物料编号!", {
          at: "center center"
        });
        return;
      }

      //如果批次不为空,批次过滤器
      if (Util.isNotNull(searchdata.mchb)) {

        MchbFilters.push(new sap.ui.model.Filter(
          "Charg",
          sap.ui.model.FilterOperator.EQ,
          searchdata.mchb
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(MchbFilters, true));
      }

      // 工厂过滤器
      WerkFilters.push(new sap.ui.model.Filter(
        "Werks",
        sap.ui.model.FilterOperator.EQ,
        searchdata.werks
      ));
      aFilterGroupsFilters.push(new sap.ui.model.Filter(WerkFilters, true));

      //发出仓库过滤器
      FackFilters.push(new sap.ui.model.Filter(
        "Lgort",
        sap.ui.model.FilterOperator.EQ,
        searchdata.stock
      ));
      aFilterGroupsFilters.push(new sap.ui.model.Filter(FackFilters, true));

      //物料过滤器
      MaterialFilters.push(new sap.ui.model.Filter(
        "Matnr",
        sap.ui.model.FilterOperator.EQ,
        searchdata.Material
      ));
      aFilterGroupsFilters.push(new sap.ui.model.Filter(MaterialFilters, true));

      this.byId("table").setBusy(true);
      var oCommonModel = this.getModel("ZSY_MM_BULKPACK_SRV");
      oCommonModel.read("/ZSY_S_MCHBSet", {
        filters: aFilterGroupsFilters,
        success: function (oData, oResponse) {
          // this.clearSelection();
          var oKcmx = new JSONModel({
            "kcmxlist": oData.results
          }); //库存明细
          oKcmx.setSizeLimit(oData.results.length);
          this.setModel(oKcmx, "oKcmxList");
          this.byId("table").setBusy(false);
        }.bind(this)
      });
    },
    ValueHelp: function (oEvent) {
      // this.openBusyDialog();
      var that = this;
      var fcode = this.getfcode(oEvent),
        sPath = "/ZSY_HR_SH_COMMSet",
        oFilters = [],
        oModelName;

      var onSearchData = this.getView().getModel("onSearch").oData;
      switch (fcode) {
        case "PERNR":
          var EZf4id = "PERNR_PRE";
          oModelName = "onSearch";
          oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
          this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitlePrePernr"));
          this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
          break;
        case "WERKS":
          var EZf4id = "WERKS";
          oModelName = "onSearch";
          oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
          this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleWERKS"));
          this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
          break;
        case "BTRTL":
          var EZf4id = "BTRTL";
          oModelName = "onSearch";
          oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
          if (onSearchData.WERKS == "") {
            this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4WerksIsNull"));
            this.oBusyDialog.close();
            return;
          }
          oFilters.push(new Filter("FILTER1", sap.ui.model.FilterOperator.EQ, onSearchData.WERKS));
          this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleBTRTL"));
          this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
          break;
        case "PERSG":
          var EZf4id = "PERSG";
          oModelName = "onSearch";
          oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
          this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitlePERSG"));
          this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
          break;
        case "PERSK":
          var EZf4id = "PERSK";
          oModelName = "onSearch";
          oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
          if (onSearchData.PERSG == "") {
            this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4PerskIsNull"));
            this.oBusyDialog.close();
            return;
          }
          oFilters.push(new Filter("FILTER1", sap.ui.model.FilterOperator.EQ, onSearchData.PERSG));
          this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitlePERSK"));
          this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
          break;
        case "DZDAMK":
          var EZf4id = "DZDAMK";
          oModelName = "onSearch";
          oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
          this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleDZDAMK"));
          this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
          break;
        case "DZDALB":
          var EZf4id = "DZDALB";
          oModelName = "onSearch";
          oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
          if (onSearchData.DZDAMK == "") {
            this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4DzdamkIsNull"));
            this.oBusyDialog.close();
            return;
          }
          oFilters.push(new Filter("FILTER1", sap.ui.model.FilterOperator.EQ, onSearchData.DZDAMK));
          this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleDZDALB"));
          this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
          break;
      }
      this._JSONModel.setProperty("/appProperties/fcode", EZf4id, false);

      this.oDataModelZCommon.read(sPath, { //
        filters: oFilters,
        success: function (oData, oResponse) {

          var oJson = oData.results;
          that.getView().getModel().setProperty("/searchHelp/f4h2r", oJson);
          // oModel.setSizeLimit(9999);
          // that.getView().getModel().getProperty("/searchHelp")
          // that.oBusyDialog.close();
          that.openDialog(oEvent);
          that.getView().setBusy(false);
        },
        error: function (error) {
          // that.oBusyDialog.close();
          that.getView().setBusy(false);
        }
      });

    },
    openDialog: function (oEvent) {

      if (!this._nonCR) {
        this._nonCR = new searchHelp(this.getView());
      }
      this._nonCR.openDialog(oEvent);
      // this.setBusy(false);
    },
  });
});