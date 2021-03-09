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
  "sap/ui/model/Filter",
  "sap/ui/core/Fragment"
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
  Filter,
  Fragment) {
  "use strict";

  return BaseController.extend("com.shunyu.dzda.controller.Index", {
    _tagfilterbar: null,
    formatTime: function (time) {
      var hh = time.substring(0, 2);
      var mm = time.substring(2, 4);
      var ss = time.substring(4, 6);
      var timeStr = hh + ':' + mm + ':' + ss;
      return timeStr;
    },
    formatDay: function (day) {
      var yyyy = day.substring(0, 4);
      var mm = day.substring(4, 6);
      var dd = day.substring(6, 8);
      var dayStr = yyyy + '-' + mm + '-' + dd;
      return dayStr;
    },
    onAfterRendering: function (oEvent) {
      // var clearBtn  = document.querySelectorAll('.customFilter .sapMBtn')[0].id;
      var goBtnID = document.querySelectorAll('.customFilter .sapMBtn')[1].id;
      var goBtn = this.byId(goBtnID);
      goBtn.setText("查询");
      goBtn.setTooltip("查询");
      // var goBtn = this.byId("application-ZSY_HR_DZDA-display-component---Index--tagfilter-btnGo"); 
      // goBtn.setText("查询");
      // var retBtn = this.byId("__component0---Index--tagfilter-btnClear");
      // retBtn.setText("重置");
    },

    //   // oInputWerks.onfocusout = function(){
    //   //   this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4WerksIsNull"));
    //   //   this.byId("WERKS").focus();
    //   // }.bind(this)
    // },

    // 初始化
    onInit: function () {
      var oPageModel = new JSONModel({
        currentPage: 1,
        totalPage: 1,
        pageCount: 100,
        totalCount: ""
      });
      this.setModel(oPageModel, "oPageModel");

      this.oDataModelPreEntry = this.getOwnerComponent().getModel("ZSY_HR_DZDA_SRV");
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
      this.setModel(oSearchModel, "searchModel");

      var isDel = {
        list: [{
          "key": "true",
          "value": "是"
        }, {
          "key": "false",
          "value": "否"
        }, ]
      }
      var oDelModel = new JSONModel(isDel);
      this.setModel(oDelModel, "delModel");

      this._get_csrf('ZSY_HR_FILESet');

      var oDatePicker = this.getView().byId("datePickerTo");
      oDatePicker.addEventDelegate({
        onAfterRendering: function () {
          var oDateInner = this.$().find('.sapMInputBaseInner');
          var oID = oDateInner[0].id;
          $('#' + oID).attr("disabled", "disabled");
        }
      }, oDatePicker);

      var oDatePicker1 = this.getView().byId("datePickerfrom");
      oDatePicker1.addEventDelegate({
        onAfterRendering: function () {
          var oDateInner = this.$().find('.sapMInputBaseInner');
          var oID = oDateInner[0].id;
          $('#' + oID).attr("disabled", "disabled");
        }
      }, oDatePicker1);

      var oTable = this.byId("table");

      oTable.addEventDelegate({
        onAfterRendering: function () {
          oTable.getColumns().forEach((oColumn, index) => {
            oTable.autoResizeColumn(index);
          });
        }.bind(this)
      });

    },
    ShowWarning: function (oMessage) {
      if (oMessage != "") {
        MessageBox.warning(oMessage, {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
    },
    ShowInfo: function (oMessage) {
      if (oMessage != "") {
        MessageBox.information(oMessage, {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
    },
    ShowMessage: function (oMessage) {
      if (oMessage != "") {
        MessageBox.error(oMessage, {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
    },
    ShowSuccess: function (oMessage) {
      if (oMessage != "") {
        MessageBox.success(oMessage, {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
    },
    onUpload: function (oEvent) {
      // this.oUploadFileType = oEvent.getSource().getSelectedKey();
      var onSearchData = this.getModel("onSearch").oData;
      if (!this.UploadDialog) {
        this.UploadDialog = sap.ui.xmlfragment(this.getView().getId(),
          "com.shunyu.dzda.view.FileUpload",
          this
        );
        this.getView().addDependent(this.UploadDialog);
      }
      this.UploadDialog.open();
      var oFileUploader = this.byId("fileUploader");
      var oDomRef = oFileUploader.getFocusDomRef();
      oFileUploader.onclick = function (oEvent) {
        if (!Util.isNotNull(onSearchData.DZDAMKUP)) {
          this.ShowWarning("请先选择电子档案模块和类别!");
          oEvent.preventDefault();
        }
      }.bind(this)
      if (Util.isNotNull(oDomRef)) {
        oDomRef.accept = '*.*';
      }

      var oDzmk = this.getView().byId("DZDAMKUP");
      oDzmk.addEventDelegate({
        onAfterRendering: function () {
          var oDzmkInner = this.$().find('.sapMInputBaseInner');
          var oID = oDzmkInner[0].id;
          $('#' + oID).attr("disabled", "disabled");
        }
      }, oDzmk);

      var oDzlbup = this.getView().byId("DZDALBUP");
      oDzlbup.addEventDelegate({
        onAfterRendering: function () {
          var oDzlbupInner = this.$().find('.sapMInputBaseInner');
          var oID = oDzlbupInner[0].id;
          $('#' + oID).attr("disabled", "disabled");
        }
      }, oDzlbup);

      // if (!this._oValueHelpDialog) {
      //   Fragment.load({
      //     name: "com.shunyu.dzda.view.FileUpload",
      //     controller: this
      //   }).then(function (oValueHelpDialog) {
      //     this._oValueHelpDialog = oValueHelpDialog;
      //     this._oValueHelpDialog.open();
      //   }.bind(this));
      // } else {
      //   this._oValueHelpDialog.open();
      // }
    },
    onDialogImageCancel: function () {
      this.clearUpload();
      this.UploadDialog.close();
      this.setModel(new JSONModel({
        "content": ""
      }), "filetypes");
    },
    onClear: function () {
      this.getModel("onSearch").setData({});
      this.byId("datePickerTo").setValue("");
      this.byId("datePickerfrom").setValue("")
    },
    // 执行按钮
    onSearch: function (oEvent) {
      var searchdata = this.getModel("onSearch").getData(),
        aFilterGroupsFilters = [],
        WerkFilters = [], //人事范围过滤器
        PernrFilters = [], // 工号过滤器
        BtrtlFilters = [], //人事子范围过滤器
        OrgFilters = [], //部门过滤器
        PersgFilters = [], //员工组过滤器
        PerskFilters = [], //员工子组过滤器
        DzdamkFilters = [], //电子档案模块
        DzdalbFilters = [], //电子档案类别
        BegdaFilters = [], //开始日期
        EnddaFilters = [], //结束日期
        IsdelFilters = []; //是否删除

      if (!Util.isNotNull(searchdata.PERNR) && (!Util.isNotNull(searchdata.WERKS))) {
        MessageToast.show("请选择人事范围!", {
          at: "center center"
        });
        return;
      }

      // 人事范围过滤器
      if (Util.isNotNull(searchdata.WERKS)) {
        WerkFilters.push(new sap.ui.model.Filter(
          "Werks",
          sap.ui.model.FilterOperator.EQ,
          searchdata.WERKS
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(WerkFilters, true));
      }

      // 员工工号
      if (Util.isNotNull(searchdata.PERNR)) {
        PernrFilters.push(new sap.ui.model.Filter(
          "Pernr",
          sap.ui.model.FilterOperator.EQ,
          searchdata.PERNR.trim()
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(PernrFilters, true));
      }
      //人事子范围
      if (Util.isNotNull(searchdata.BTRTL)) {
        BtrtlFilters.push(new sap.ui.model.Filter(
          "Btrtl",
          sap.ui.model.FilterOperator.EQ,
          searchdata.BTRTL
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(BtrtlFilters, true));
      }

      //部门组织
      if (Util.isNotNull(searchdata.ORG)) {
        OrgFilters.push(new sap.ui.model.Filter(
          "Orgeh",
          sap.ui.model.FilterOperator.EQ,
          searchdata.ORG
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(OrgFilters, true));
      }

      //员工组范围
      if (Util.isNotNull(searchdata.PERSG)) {
        PersgFilters.push(new sap.ui.model.Filter(
          "Persg",
          sap.ui.model.FilterOperator.EQ,
          searchdata.PERSG
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(PersgFilters, true));
      }

      //员工子组
      if (Util.isNotNull(searchdata.PERSK)) {
        PerskFilters.push(new sap.ui.model.Filter(
          "Persk",
          sap.ui.model.FilterOperator.EQ,
          searchdata.PERSK
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(PerskFilters, true));
      }

      //电子档案模块
      if (Util.isNotNull(searchdata.DZDAMK)) {
        DzdamkFilters.push(new sap.ui.model.Filter(
          "Zhrmk",
          sap.ui.model.FilterOperator.EQ,
          searchdata.DZDAMK
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(DzdamkFilters, true));
      }

      //电子档案类别
      if (Util.isNotNull(searchdata.DZDALB)) {
        DzdalbFilters.push(new sap.ui.model.Filter(
          "Zhrdzdalb",
          sap.ui.model.FilterOperator.EQ,
          searchdata.DZDALB
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(DzdalbFilters, true));
      }

      //进入集团日期
      if (Util.isNotNull(this.byId("datePickerfrom").getValue())) {
        BegdaFilters.push(new sap.ui.model.Filter(
          "Rybeg", //pa0000中的开始日期
          sap.ui.model.FilterOperator.GE,
          this.byId("datePickerfrom").getValue()
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(BegdaFilters, true));
      }
      //离开集团日期
      if (Util.isNotNull(this.byId("datePickerTo").getValue())) {
        EnddaFilters.push(new sap.ui.model.Filter(
          "Ryend", //pa0000中的结束日期
          sap.ui.model.FilterOperator.LE,
          this.byId("datePickerTo").getValue()
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(EnddaFilters, true));
      }

      var sIsdel = this.byId("isdel").getSelectedKey();
      //是否删除
      if (Util.isNotNull(sIsdel)) {
        IsdelFilters.push(new sap.ui.model.Filter(
          "Isdel",
          sap.ui.model.FilterOperator.EQ,
          sIsdel
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(IsdelFilters, true));
      }


      this.byId("table").setBusy(true);
      var oDzdaModel = this.getModel("ZSY_HR_DZDA_SRV");
      oDzdaModel.setUseBatch(false);
      oDzdaModel.read("/ZSY_HR_S_DZDASet", {
        filters: aFilterGroupsFilters,
        success: function (oData, oResponse) {
          this.changeIndex(oData.results)

          // this.clearSelection();
          var oDzda = new JSONModel({
            "dzdalist": oData.results
          });
          oDzda.setSizeLimit(oData.results.length);
          this.setModel(oDzda, "oDzda");
          this.byId("table").setBusy(false);
        }.bind(this)
      });
    },
    ValueHelp: function (oEvent) {
      this.openBusyDialog();
      var that = this;
      var fcode = this.getfcode(oEvent),
        sPath = "/ZSY_HR_SH_COMMSet",
        oFilters = [],
        oModelName;

      var onSearchData = this.getView().getModel("onSearch").oData;
      switch (fcode) {
        case "PERNR":
          var EZf4id = "PERNR";
          oModelName = "onSearch";
          oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
          if (onSearchData.WERKS == "") {
            this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4WerksIsNull"));
            this.oBusyDialog.close();
            return;
          }
          oFilters.push(new Filter("FILTER1", sap.ui.model.FilterOperator.EQ, onSearchData.WERKS));
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
        case "DZDAMKUP":
          var EZf4id = "DZDAMKUP";
          oModelName = "onSearch";
          oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
          this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleDZDAMK"));
          this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
          break;
        case "DZDALBUP":
          var EZf4id = "DZDALBUP";
          oModelName = "onSearch";
          oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
          if (onSearchData.DZDAMKUP == "") {
            this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4DzdamkIsNull"));
            this.oBusyDialog.close();
            return;
          }
          oFilters.push(new Filter("FILTER1", sap.ui.model.FilterOperator.EQ, onSearchData.DZDAMKUP));
          this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleDZDALB"));
          this._JSONModel.setProperty("/searchHelp/ModelName", oModelName, false);
          break;
        case "ORG":
          var EZf4id = "ORG";
          oModelName = "onSearch";
          oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, EZf4id));
          if (onSearchData.WERKS == "") {
            this.ShowMessage(this._ResourceBundle.getText("oCheckErrorF4WerksIsNull"));
            this.oBusyDialog.close();
            return;
          }
          oFilters.push(new Filter("FILTER1", sap.ui.model.FilterOperator.EQ, onSearchData.WERKS));
          this._JSONModel.setProperty("/appProperties/f4title", this._ResourceBundle.getText("TitleORG"));
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
          that.oBusyDialog.close();
          that.openDialog(oEvent);
          // that.getView().setBusy(false);
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
    changeIndex: function (list) {
      $.each(list, function (i, item) {
        item.Seq = i + 1;
      });
    },
    handleBeforeUpload: function () {},
    onUploadComplete: function (oEvent) {},
    onDialogImageOk: function (params) {
      var oFileTableData = this.getModel("MyFile");
      var fileType = this.getModel("onSearch").getData().DZDALBUP; //上传的电子档案模块
      var fileTypeT = this.getModel("onSearch").getData().DZDALBTUP; //所选的电子档案类别文本
      var pernrUp = this.byId("PernrUp").getValue(); //上传的工号
      var DZDAMKUP = this.byId("DZDAMKUP").getValue(); //上传的电子档案模块
      var DZDALBUP = this.byId("DZDALBUP").getValue(); //上传的电子档案类别
      var oEntity = {
        Pernr: "",
        Zdzdamk: DZDAMKUP,
        Zdzdalb: DZDALBUP,
        Type: "",
        Message: "",
        ZSY_FILE_ISet: []
      }
      if (!Util.isNotNull(DZDALBUP)) {
        MessageToast.show("请选择电子档案类别!");
        return;
      }
      if (!Util.isNotNull(oFileTableData)) {
        MessageToast.show("请先上传文件!");
        return;
      }
      if (!Util.isNotNull(oFileTableData.getData())) {
        MessageToast.show("请先上传文件!");
        return;
      }
      var flag = true; //判断是否通过验证
      if (Util.isNotNull(pernrUp)) {
        oEntity.Pernr = pernrUp;
      } else { //工号为空则校验文件名称和类型是否符合
        var aFile = this.getModel("MyFile").getData();
        for (let i = 0; i < aFile.length; i++) {
          const file = aFile[i];
          if (file.Isvalid == '') { //说明有工号不存在
            MessageToast.show(file.FilenameOld + "格式不正确,工号在主系统中不存在!");
            flag = false;
            break;
          }
          if (file.FilenameOld) {
            var aNamelist = file.FilenameOld.split('_'); //拆分文件名称
            if (aNamelist.length > 0) {
              if (fileTypeT != aNamelist[1].split(".")[0]) {
                MessageToast.show(file.FilenameOld + "格式不正确,请检查文档命名后再进行上传!");
                flag = false;
                break;
              }
            } else {
              MessageToast.show(file.FilenameOld + "格式不正确,请检查文档命名后再进行上传!");
              flag = false;
              break;
            }
          } else {
            MessageToast.show(file.FilenameOld + "格式不正确,请检查文档命名后再进行上传!");
            flag = false;
            break;
          }
        }
      }

      if (!flag) {
        return;
      }
      var sPath = "/ZSY_FILE_HSet";
      oEntity.ZSY_FILE_ISet = oFileTableData.getData();
      for (let i = 0; i < oEntity.ZSY_FILE_ISet.length; i++) {
        const element = oEntity.ZSY_FILE_ISet[i];
        element.Filetype = fileType;
        var sFixIndex = element.FilenameOld.lastIndexOf("\.");
        //截取最后一个/后的值
        var filefix = element.FilenameOld.substring(sFixIndex, element.FilenameOld.length);
        if (!this.getView()._filetype.toLowerCase() == '*.*') {
          if (this.getView()._filetype.toLowerCase().indexOf(filefix.toLowerCase()) == -1) { //上传前校验格式
            flag = false;
            break;
          }
        }
        if (Util.isNotNull(oEntity.Pernr)) { //选择工号自动生成模板信息
          var pernr8 = Util.PrefixInteger(oEntity.Pernr, 8); //工号补零
          element.Filename = pernr8 + '_' + fileTypeT + '_' + element.Sydate + filefix;
        } else { //不然就取上i
          var sIndex = element.FilenameOld.indexOf("_");
          var sSecIndex = element.FilenameOld.indexOf('_', sIndex + 1); //获取到第二个_的index
          if (sSecIndex == -1) { //防止没有第二个_
            var dzdalb = element.FilenameOld.split("_")[1].split(".")[0];
          } else {
            var dzdalb = element.FilenameOld.substring(sIndex + 1, sSecIndex);
          }
          var pernr8 = Util.PrefixInteger(element.FilenameOld.substring(0, sIndex), 8);
          element.Filename = pernr8 + '_' + dzdalb + '_' + element.Sydate + filefix;
        }
      }

      if (!flag) {
        MessageToast.show("所选电子档案类别支持的文件类型为" + this.getView()._filetype.toLowerCase());
        return;
      }

      this.oDataModelPreEntry.create(sPath, oEntity, { //
        success: function (oData, oResponse) {
          // this.oBusyDialog.close();
          if (oData.Type == 'S') {
            this.ShowSuccess("上传成功!");
            this.UploadDialog.close();
            this.clearUpload();
            this.onSearch();
          } else {
            this.ShowMessage(oData.Message);
          }
        }.bind(this),
        error: function (oError) {
          // that.oBusyDialog.close();
          // that.oInitCheckDialog.close();
        }
      });
    },
    handleTypeMissmatch: function (oEvent) {
      var aFileTypes = oEvent.getSource().getFileType();
      jQuery.each(aFileTypes, function (key, value) {
        aFileTypes[key] = "*." + value;
      });
      var sSupportedFileTypes = aFileTypes.join(", ");
      MessageToast.show("The file type *." + oEvent.getParameter("fileType") +
        " is not supported. Choose one of the following types: " +
        sSupportedFileTypes);
    },
    handleValueChange: function (oEvent) {

      var oFileTableModel = this.getModel("MyFile"),
        oFileTableData;
      if (oFileTableModel != undefined) {
        oFileTableData = oFileTableModel.oData;
      } else {
        oFileTableData = new Array();
      }
      var oFileUploader = this.byId("fileUploader");
      var oDomRef = oFileUploader.getFocusDomRef();
      var files = oDomRef.files;
      if (!oFileUploader.getValue()) {
        // MessageToast.show("请先上传文件");
        return;
      }
      this.openBusyDialog();
      this._get_csrf('ZSY_HR_FILESet');
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        var filePernr = "";
        if (file.name.indexOf('_') > -1) {
          var aNamelist = file.name.split('_'); //拆分文件名称获取到第一个_前的工号
          filePernr = aNamelist[0];
          if (!Util.isNum(filePernr)) {
            filePernr = "";
          }
        }
        try {
          if (file) {
            var oFileRow = {
              Pernr: filePernr,
              Sydate: "",
              Filetype: "",
              Sytime: "",
              Filename: "",
              FilenameOld: file.name,
              Mimetype: "",
              Syuname: "",
              Value: "",
              Url: "",
              IsIcon: "",
              Isvalid: ""
            };

            var that = this;
            var _handleSuccess = function (data, xhr, settings) {
              that.oBusyDialog.close();
              var oReFile = data.d; //odata返回的文件流
              oFileRow.Sydate = oReFile.Sydate;
              oFileRow.Sytime = oReFile.Sytime;
              oFileRow.Mimetype = oReFile.Mimetype;
              oFileRow.Syuname = oReFile.Syuname;
              oFileRow.Value = oReFile.Value;
              oFileRow.Isvalid = oReFile.Isvalid; //用来判断该上传的文件名的工号在主系统中是否存在 X表示存在
              oFileTableData.push(oFileRow)
            };
            var _handleError = function (data) {
              that.oBusyDialog.close();
              // debugger;
              var errorMsg = '';
              if (data.responseText[1]) {
                errorMsg = /<message>(.*?)<\/message>/.exec(data.responseText)[1];
              } else {
                errorMsg = 'Something bad happened';
              }
              that.fireUploadComplete({
                "response": "Error: " + errorMsg
              });
              that._bUploading = false;
            };

            var oHeaders = {
              "x-csrf-token": this._csrfToken,
              "slug": encodeURIComponent(file.name),
              "pernr": encodeURIComponent(filePernr)
            };
            jQuery.ajax({
              type: 'POST',
              url: this._url,
              async: false,
              headers: oHeaders,
              cache: false,
              contentType: file.type,
              processData: false,
              data: file,
              dataType: "json",
              success: _handleSuccess,
              error: _handleError
            });
          }
        } catch (oException) {
          jQuery.sap.log.error("导入失败:\n" + oException.message);
        }
      }
      this.setModel(new JSONModel(oFileTableData), "MyFile");
      oFileUploader.setValue("");
    },
    _get_csrf: function (entrySet) {
      var url = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "") +
        "/sap/opu/odata/sap/ZSY_HR_DZDA_SRV/" + entrySet;
      this._url = url;
      var that = this;
      jQuery.ajax({
        url: url,
        async: false,
        headers: {
          "X-CSRF-Token": "Fetch",
          "X-Requested-With": "XMLHttpRequest",
          "DataServiceVersion": "2.0"
        },
        type: "GET",
        contentType: "application/json",
        dataType: 'json',

        success: function (data, textStatus, jqXHR) {
          that._csrfToken = jqXHR.getResponseHeader('x-csrf-token');
          return that._csrfToken;
        }
      });
    },
    onDownload: function () {
      var oTable = this.byId("table");
      var oSelectedIndexs = oTable.getSelectedIndices();
      if (oSelectedIndexs.length == 0) {
        this.ShowWarning(this._ResourceBundle.getText("oSelectValid"));
        return;
      }
      if (!this.checkIsDel()) { //说明有删除的
        this.ShowWarning(this._ResourceBundle.getText("oSelDel"));
        return;
      }
      var oList = this.getModel("oDzda").getData().dzdalist;
      var selArray = new Array();
      for (let i = 0; i < oSelectedIndexs.length; i++) {
        var index = oSelectedIndexs[i];
        var selItem = oList[index];
        selArray.push(selItem);
      }
      const sorted = Util.groupBy(selArray, function (item) { //获取按工号分组的数据
        return [item.Pernr];
      });
      // console.log(sorted);
      for (let i = 0; i < sorted.length; i++) {
        var perGroup = sorted[i]; //获取到每一分组
        var guids = ""
        for (let j = 0; j < perGroup.length; j++) {
          var element = perGroup[j]; //获取到组的一条记录
          var guid = element.Compid;
          guids += guid + ",";
        }
        guids = guids.substring(0, guids.length - 1);
        window.open("/sap/opu/odata/sap/ZSY_HR_DZDA_SRV/ZSY_HR_FILESet(Guid='" + guids + "')/$value");
      }
    },
    onView: function () {
      var oTable = this.byId("table");
      var oSelectedIndexs = oTable.getSelectedIndices();
      if (oSelectedIndexs.length == 0) {
        this.ShowWarning(this._ResourceBundle.getText("oSelectValid"));
        return;
      }
      if (!this.checkIsDel()) { //说明有删除的
        this.ShowWarning(this._ResourceBundle.getText("oSelDel"));
        return;
      }
      var oList = this.getModel("oDzda").getData().dzdalist;
      for (let i = 0; i < oSelectedIndexs.length; i++) {
        var index = oSelectedIndexs[i];
        //之前没有直接预览的地址
        var guid = oList[index].Compid;
        window.open("/sap/opu/odata/sap/ZSY_HR_COMMON_SH_SRV/ZSY_HR_FILESet(Guid='" + guid + "')/$value");
        //直接用生成的地址
        // var url = oList[index].Zhrdacfdz;
        // window.open('/' + url);
      }
    },
    onDelete: function () {
      var oTable = this.byId("table");
      var oSelectedIndexs = oTable.getSelectedIndices();
      if (oSelectedIndexs.length == 0) {
        this.ShowWarning(this._ResourceBundle.getText("oSelectValid"));
        return;
      }
      if (!this.checkIsDel()) { //说明有删除的
        this.ShowWarning(this._ResourceBundle.getText("oSelDel"));
        return;
      }
      var oEntity = {
        Pernr: "",
        Type: "",
        Message: "",
        Action: "1" //表示删除
      }
      var ZSY_FIXZ_ISet = new Array();
      var oTable = this.byId("table");
      var oList = this.getModel("oDzda").getData().dzdalist;
      var oSelectedIndexs = oTable.getSelectedIndices();
      for (let i = 0; i < oSelectedIndexs.length; i++) {
        var index = oSelectedIndexs[i];
        var fixzi = {
          Pernr: oList[index].Pernr,
          Guid: oList[index].Compid
        }
        ZSY_FIXZ_ISet.push(fixzi);
      }
      oEntity.ZSY_FIXZ_ISet = ZSY_FIXZ_ISet;
      oEntity.Pernr = oList[0].Pernr;

      var sPath = "/ZSY_FIXZ_HSet";
      this.oDataModelPreEntry.create(sPath, oEntity, { //
        success: function (oData, oResponse) {
          if (oData.Type == 'S') {
            this.ShowSuccess("删除成功!");
            this.onSearch();
          } else {
            this.ShowMessage(oData.Message);
          }
        }.bind(this),
        error: function (oError) {}
      });

    },
    onRet: function () {
      var oTable = this.byId("table");
      var oSelectedIndexs = oTable.getSelectedIndices();
      if (oSelectedIndexs.length == 0) {
        this.ShowWarning(this._ResourceBundle.getText("oSelectValid"));
        return;
      }
      if (!this.checkIsNotDel()) { //说明有删除的
        this.ShowWarning(this._ResourceBundle.getText("oSelNotDel"));
        return;
      }
      var oEntity = {
        Pernr: "",
        Type: "",
        Message: "",
        Action: "2" //表示找回
      }
      var ZSY_FIXZ_ISet = new Array();
      var oTable = this.byId("table");
      var oList = this.getModel("oDzda").getData().dzdalist;
      var oSelectedIndexs = oTable.getSelectedIndices();
      for (let i = 0; i < oSelectedIndexs.length; i++) {
        var index = oSelectedIndexs[i];
        var fixzi = {
          Pernr: oList[index].Pernr,
          Guid: oList[index].Compid
        }
        ZSY_FIXZ_ISet.push(fixzi);
      }
      oEntity.ZSY_FIXZ_ISet = ZSY_FIXZ_ISet;
      oEntity.Pernr = oList[0].Pernr;

      var sPath = "/ZSY_FIXZ_HSet";
      this.oDataModelPreEntry.create(sPath, oEntity, { //
        success: function (oData, oResponse) {
          if (oData.Type == 'S') {
            this.ShowSuccess("找回成功!");
            this.onSearch();
          } else {
            this.ShowMessage(oData.Message);
          }
        }.bind(this),
        error: function (oError) {}
      });
    },
    // onView2: function (file) {
    //   var reader = new FileReader();
    //   var that = this;
    //   reader.onload = function (e) {
    //     var raw = e.target.result;
    //     var hexString = that.convertBinaryToHex(raw).toUpperCase();
    //     // DO YOUR THING HERE            
    //   };

    //   reader.onerror = function () {
    //     sap.m.MessageToast.show("Error occured when uploading file");
    //   };

    //   reader.readAsDataURL(file);
    // },
    // convertBinaryToHex: function (buffer) {
    //   return Array.prototype.map.call(new Uint8Array(buffer), function (x) {
    //     return ("00" + x.toString(16)).slice(-2);
    //   }).join("");
    // },
    onDeleteFile: function (oEvent) {
      var index = oEvent.getParameter("listItem").getBindingContextPath().replace("/", ""); //获取删除第几个文件
      var oData = this.getModel("MyFile").getData();
      oData.splice(index, 1);
      this.setModel(new JSONModel(oData), "MyFile")
    },
    clearUpload: function () {
      if (Util.isNotNull(this.getModel("MyFile"))) {
        this.getModel("MyFile").setData(new Array());
      }
      this.byId("PernrUp").setValue("");
      this.byId("DZDAMKUP").setValue("");
      this.byId("DZDALBUP").setValue("");
    },
    checkIsDel: function () {
      var oTable = this.byId("table");
      var oList = this.getModel("oDzda").getData().dzdalist;
      var oSelectedIndexs = oTable.getSelectedIndices();
      var flag = true;
      for (let i = 0; i < oSelectedIndexs.length; i++) {
        var index = oSelectedIndexs[i];
        var item = oList[index];
        if (item.Isdel == true) {
          flag = false;
          break;
        }
      }
      return flag;
    },
    checkIsNotDel: function () {
      var oTable = this.byId("table");
      var oList = this.getModel("oDzda").getData().dzdalist;
      var oSelectedIndexs = oTable.getSelectedIndices();
      var flag = true;
      for (let i = 0; i < oSelectedIndexs.length; i++) {
        var index = oSelectedIndexs[i];
        var item = oList[index];
        if (item.Isdel == false) {
          flag = false;
          break;
        }
      }
      return flag;
    }
  });
});