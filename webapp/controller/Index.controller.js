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

    onclear: function onclear() {
      alert("11")
    },
    // 初始化
    onInit: function () {
      this.FileType01Max = '00';
      this.FileType02Max = '00';
      this.FileType03Max = '00';
      this.FileType04Max = '00';
      this.FileType05Max = '00';
      this.FileType06Max = '00';

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

      this._get_csrf('ZSY_HR_FILESet');
    },
    ShowMessage: function (oMessage) {
      if (oMessage != "") {
        MessageBox.error(oMessage, {
          styleClass: "sapUiSizeCompact"
        });
        return;
      }
    },
    onUpload: function (oEvent) {
      // this.oUploadFileType = oEvent.getSource().getSelectedKey();
      if (!this.UploadDialog) {
        this.UploadDialog = sap.ui.xmlfragment(this.getView().getId(),
          "com.shunyu.dzda.view.FileUpload",
          this
        );
        this.getView().addDependent(this.UploadDialog);
      }

      this.UploadDialog.open();
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
      this.UploadDialog.close();
    },
    // 执行按钮
    onSearch: function (oEvent) {
      var searchdata = this.getModel("onSearch").getData(),
        aFilterGroupsFilters = [],
        WerkFilters = [], //人事范围过滤器
        PernrFilters = [], // 工号过滤器
        BtrtlFilters = [], //人事子范围过滤器
        PersgFilters = [], //员工组过滤器
        PerskFilters = [], //员工子组过滤器
        DzdamkFilters = [], //电子档案模块
        DzdalbFilters = [], //电子档案类别
        BegdaFilters = [], //开始日期
        EnddaFilters = []; //结束日期

      if (!Util.isNotNull(searchdata.WERKS)) {
        MessageToast.show("请选择人事范围!", {
          at: "center center"
        });
        return;
      }

      // 人事范围过滤器
      WerkFilters.push(new sap.ui.model.Filter(
        "Werks",
        sap.ui.model.FilterOperator.EQ,
        searchdata.WERKS
      ));
      aFilterGroupsFilters.push(new sap.ui.model.Filter(WerkFilters, true));

      //人事子范围
      if (Util.isNotNull(searchdata.BTRTL)) {
        BtrtlFilters.push(new sap.ui.model.Filter(
          "Btrtl",
          sap.ui.model.FilterOperator.EQ,
          searchdata.BTRTL
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(BtrtlFilters, true));
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
          "Ryend", //pa0000中的开始日期
          sap.ui.model.FilterOperator.GE,
          this.byId("datePickerfrom").getValue()
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(BegdaFilters, true));
      }
      //离开集团日期
      if (Util.isNotNull(this.byId("datePickerTo").getValue())) {
        EnddaFilters.push(new sap.ui.model.Filter(
          "Rybeg", //pa0000中的结束日期
          sap.ui.model.FilterOperator.LE,
          this.byId("datePickerTo").getValue()
        ));
        aFilterGroupsFilters.push(new sap.ui.model.Filter(EnddaFilters, true));
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
            //this.oBusyDialog.close();
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
            //this.oBusyDialog.close();
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
            //this.oBusyDialog.close();
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
            //this.oBusyDialog.close();
            return;
          }
          oFilters.push(new Filter("FILTER1", sap.ui.model.FilterOperator.EQ, onSearchData.DZDAMKUP));
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
    changeIndex: function (list) {
      $.each(list, function (i, item) {
        item.Seq = i + 1;
      });
    },
    handleBeforeUpload: function () {},
    onUploadComplete: function (oEvent) {},
    onDialogImageOk: function (params) {
      var oFileTableData = this.getModel("MyFile");
      var fileType = this.getModel("onSearch").getData().DZDALBUP;
      var fileTypeT = this.getModel("onSearch").getData().DZDALBTUP; //所选的电子档案类别文本
      var oEntity = {
        Pernr: "",
        ZSY_FILE_ISet: []
      }
      var pernrUp = this.byId("PernrUp").getValue(); //上传的工号
      // var DzdaMkUP = this.byId("DzdaMkUP").getValue(); //上传的电子档案模块
      var DZDALBUP = this.byId("DZDALBUP").getValue(); //上传的电子档案类别
      if (!Util.isNotNull(DZDALBUP)) {
        MessageToast.show("请选择电子档案类别!");
        return;
      }
      if (Util.isNotNull(pernrUp)) {
        oEntity.Pernr = pernrUp;
      } else { //工号为空则校验文件名称和类型是否符合
        var aFile = this.getModel("MyFile").getData();
        for (let i = 0; i < aFile.length; i++) {
          const file = aFile[i];
          if (file.ISICON == '') { //说明有工号不存在
            MessageToast.show(file.FilenameOld + "的工号在主系统中不存在,请检查文档命名后再进行上传!");
            break;
          }
          if (file.FilenameOld) {
            var aNamelist = file.FilenameOld.split('_'); //拆分文件名称
            if (aNamelist.length > 0) {
              if (fileTypeT != aNamelist[1]) {
                MessageToast.show(file.FilenameOld + "格式不正确,请检查文档命名后再进行上传!");
                break;
              }
            } else {
              MessageToast.show(file.FilenameOld + "格式不正确,请检查文档命名后再进行上传!");
              break;
            }
          } else {
            MessageToast.show(file.FilenameOld + "格式不正确,请检查文档命名后再进行上传!");
            break;
          }
        }
      }

      var sPath = "/ZSY_FILE_HSet";
      oEntity.ZSY_FILE_ISet = oFileTableData.getData();
      for (let i = 0; i < oEntity.ZSY_FILE_ISet.length; i++) {
        const element = oEntity.ZSY_FILE_ISet[i];
        element.Filetype = fileType;
        if (Util.isNotNull(oEntity.Pernr)) { //选择工号自动生成模板信息
          var pernr8 = Util.PrefixInteger(oEntity.Pernr, 8); //工号补零

          var sIndex = element.FilenameOld.lastIndexOf("\.");
          //截取最后一个/后的值
          var filefix = element.FilenameOld.substring(sIndex, element.FilenameOld.length);
          element.Filename = pernr8 + '_' + fileTypeT + '_' + element.Sydate + filefix;
        } else { //不然就取上传文件名
          var sIndex = element.FilenameOld.indexOf("_");
          var pernr8 = Util.PrefixInteger(element.FilenameOld.substring(0, sIndex), 8);;
          element.Filename = pernr8 + element.FilenameOld.substring(sIndex, element.FilenameOld.length);
        }
      }
      this.oDataModelPreEntry.create(sPath, oEntity, { //
        success: function (oData, oResponse) {
          // that.oBusyDialog.close();
          if (oData.Type == 'E') {
            that.ShowMessage(oData.Message);
          } else {
            // that.oInitCheckDialog.close();
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
      // var file0 = oDomRef.files[0];
      if (!oFileUploader.getValue()) {
        // MessageToast.show("请先上传文件");
        return;
      }
      this._get_csrf('ZSY_HR_FILESet');
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        var filePernr = "";
        if (file.name.indexOf('_') > -1) {
          var aNamelist = file.name.split('_'); //拆分文件名称获取到第一个_前的工号
          filePernr = aNamelist[0];
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
              IsIcon: ""
            };

            var that = this;
            var _handleSuccess = function (data, xhr, settings) {
              var oReFile = data.d; //odata返回的文件流
              oFileRow.Sydate = oReFile.Sydate;
              oFileRow.Sytime = oReFile.Sytime;
              oFileRow.Mimetype = oReFile.Mimetype;
              oFileRow.Syuname = oReFile.Syuname;
              oFileRow.Value = oReFile.Value;
              oFileRow.IsIcon = oReFile.IsIcon; //用来判断该上传的文件名的工号在主系统中是否存在 X表示存在
              oFileTableData.push(oFileRow)
            };
            var _handleError = function (data) {
              debugger;
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
              "pernr": filePernr
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
    onDeleteFile: function (oEvent) {
      var index = oEvent.getParameter("listItem").getBindingContextPath().replace("/", ""); //获取删除第几个文件
      var oData = this.getModel("MyFile").getData();
      oData.splice(index, 1);
      this.setModel(new JSONModel(oData), "MyFile")
    }
  });
});