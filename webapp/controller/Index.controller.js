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
        DzdalbFilters = []; //电子档案类别

      if (!Util.isNotNull(searchdata.WERKS)) {
        MessageToast.show("请选择人事范围!", {
          at: "center center"
        });
        return;
      }

      // //如果批次不为空,批次过滤器
      // if (Util.isNotNull(searchdata.mchb)) {

      //   MchbFilters.push(new sap.ui.model.Filter(
      //     "Charg",
      //     sap.ui.model.FilterOperator.EQ,
      //     searchdata.mchb
      //   ));
      //   aFilterGroupsFilters.push(new sap.ui.model.Filter(MchbFilters, true));
      // }

      // // 工厂过滤器
      // WerkFilters.push(new sap.ui.model.Filter(
      //   "Werks",
      //   sap.ui.model.FilterOperator.EQ,
      //   searchdata.werks
      // ));
      // aFilterGroupsFilters.push(new sap.ui.model.Filter(WerkFilters, true));

      this.byId("table").setBusy(true);
      var oDzdaModel = this.getModel("ZSY_HR_DZDA_SRV");
      oDzdaModel.setUseBatch(false);
      oDzdaModel.read("/ZSY_HR_S_DZDASet", {
        // filters: aFilterGroupsFilters,
        success: function (oData, oResponse) {
          this.changeIndex(oData.results)

          // this.clearSelection();
          var oDzda = new JSONModel({
            "dzdalist": oData.results
          }); //库存明细
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
    handleBeforeUpload: function () {
    },
    onUploadComplete: function (oEvent) {
    },
    onDialogImageOk: function (params) {
      // upload file
      var oFileUploader = this.byId("fileUploader");

      var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
      this.oFile = file;
      if (!oFileUploader.getValue()) {
        MessageToast.show("请先上传文件");
        return;
      }
      this._get_csrf('ZSY_HR_FILESet');
      try {
        if (file) {
          var that = this;

          var _handleSuccess = function (event, xhr, settings, data) {
            debugger;
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
            "slug": encodeURIComponent(file.name)
          };
          jQuery.ajax({
            type: 'POST',
            url: this._url,
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
    },
    onDialogImageOk1: function (oEvent) {
      // upload file
      var oFileUploader = this.byId("fileUploader");

      var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
      this.oFile = file;
      if (!oFileUploader.getValue()) {
        MessageToast.show("请先上传文件");
        return;
      }
      if (file.name) {
        var alist = file.name.split('_'); //拆分合同名称
        if (alist.length > 0) {
          var selDzdalbT = this.getModel("onSearch").getData().DZDALBTUP; //所选的电子档案类别文本
          if (selDzdalbT != alist[1]) {
            MessageToast.show("请检查文档命名后再进行上传!");
            return;
          }
        } else {
          MessageToast.show("请检查文档命名后再进行上传!");
          return;
        }
      }
      var oFileTableModel = this.getView().getModel("MyFile");
      if (oFileTableModel != undefined) {
        var oFileTableData = oFileTableModel.oData;
        for (var i = 0; i < oFileTableData.length; i++) {
          if (file.name == oFileTableData[i].FILENAME_OLD) {
            this.ShowMessage(this._ResourceBundle.getText("oErrorFileName"));
            return;
          }
        }
      }
      if (file) {
        var that = this;
        this.filename = file.name;
        var sPath = "/ZSY_HR_FILESet";
        var oReturnTable = {
          PERNR: '10000015',
          SYDATE: "",
          FILETYPE: this.oUploadFileType,
          SYTIME: "",
          FILENAME: this.changeFileName(),
          FILENAME_OLD: file.name,
          MIMETYPE: "",
          SYUNAME: "",
          VALUE: "",
          URL: ""
        };
        var oHeaders = {
          "is_icon": '',
          "FileType": file.type
        };
        this.oDataModelPreEntry.setHeaders(oHeaders);
        this.oDataModelPreEntry.create(sPath, oReturnTable, { //
          // filters: oFilters,
          success: function (oData, oResponse) {
            var oFileTableModel = that.getView().getModel("MyFile");

            var oFileTableRow = {
                PERNR: "",
                FILETYPE: "",
                FILENAME_OLD: "",
                FILENAME: "",
                MIMETYPE: "",
                SYUNAME: "",
                SYDATE: "",
                SYTIME: "",
                VALUE: "",
                URL: ""
              },
              oFileTableData;
            if (oFileTableModel != undefined) {
              oFileTableData = oFileTableModel.oData;
            } else {
              oFileTableData = [];
            }
            oFileTableRow.PERNR = that.getModel("PersonInfo").oData.PERNR;
            oFileTableRow.FILETYPE = that.oUploadFileType;
            var oFileTypeList = that.filename.split('.'),
              oFileTypeLength = oFileTypeList.length;
            oFileTableRow.FILENAME = that.changeFileName() + '.' + oFileTypeList[oFileTypeLength - 1];
            oFileTableRow.FILENAME_OLD = that.filename;
            oFileTableRow.MIMETYPE = oData.MIMETYPE;
            oFileTableRow.SYUNAME = oData.SYUNAME;
            oFileTableRow.SYDATE = oData.SYDATE;
            oFileTableRow.SYTIME = oData.SYTIME;
            oFileTableRow.VALUE = oData.VALUE;
            // var oReturnList = event.childNodes[0].children[6]["childNodes"];
            // for (var i = 0; i < oReturnList.length; i++) {
            // 	var oNodeName = oReturnList[i].nodeName,
            // 		oNodeValue = oReturnList[i].childNodes[0];

            // 	var oFieldName = oNodeName.split(':')[1];
            // 	switch (oFieldName) {
            // 		case 'PERNR':
            // 			oFileTableRow.PERNR = oNodeValue.data;
            // 			break;
            // 		case 'FILETYPE':
            // 			oFileTableRow.FILETYPE = oNodeValue.data;
            // 			break;
            // 		case 'FILENAME':
            // 			oFileTableRow.FILENAME = oNodeValue.data;
            // 			break;
            // 		case 'FILENAME_OLD':
            // 			oFileTableRow.FILENAME_OLD = oNodeValue.data;
            // 			break;
            // 		case 'MIMETYPE':
            // 			oFileTableRow.MIMETYPE = oNodeValue.data;
            // 			break;
            // 		case 'SYUNAME':
            // 			oFileTableRow.SYUNAME = oNodeValue.data;
            // 			break;
            // 		case 'SYDATE':
            // 			oFileTableRow.SYDATE = oNodeValue.data;
            // 			break;
            // 		case 'SYTIME':
            // 			oFileTableRow.SYTIME = oNodeValue.data;
            // 			break;
            // 		case 'VALUE':
            // 			oFileTableRow.VALUE = oNodeValue.data;
            // 			break;
            // 	}
            // }
            oFileTableData.push(oFileTableRow);
            that.getView().setModel(new JSONModel(oFileTableData), "MyFile");

          },
          error: function (oError) {
            console.log(oError)
          }
        });
      }
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
      var oFileUploader = this.byId("fileUploader");
      var oDomRef = oFileUploader.getFocusDomRef();
      var file = oDomRef.files[0];
      if (!oFileUploader.getValue()) {
        MessageToast.show("请先上传文件");
        return;
      }
      this._get_csrf('ZSY_HR_FILESet');
      try {
        if (file) {
          var that = this;

          var _handleSuccess = function (event, xhr, settings, data) {
            debugger;
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
            "slug": encodeURIComponent(file.name)
          };
          jQuery.ajax({
            type: 'POST',
            url: this._url,
            async:false,
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
      // var oFileUploader = oEvent.getSource();
      // oFileUploader.removeAllHeaderParameters();
      // //x-csrf-token:
      // oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
      //   name: "x-csrf-token",
      //   value: this._csrfToken
      // }));

      // MessageToast.show("点击确定按钮上传文件'" + oEvent.getParameter("newValue") + "'");

    },
    _get_csrf: function (entrySet) {
      var url = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "") +
        "/sap/opu/odata/sap/ZSY_HR_DZDA_SRV/" + entrySet;
      this._url = url;
      var that = this;
      var _csrfToken = "";
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
    changeFileName: function () {
      this.oUploadFileType = '01';
      var NewFileName,
        UploadTypeDesc,
        oDate = new Date(),
        counter, //conuter for file in one type
        DateTime = oDate.getFullYear().toString() + oDate.getMonth().toString() + oDate.getDate().toString();

      var oFileDrop = this.createFileTable(); //文件
      for (var i = 0; i < oFileDrop.length; i++) {
        if (oFileDrop[i].FileType == this.oUploadFileType) {
          UploadTypeDesc = oFileDrop[i].FileDesc;
          break;
        }
      }

      switch (this.oUploadFileType) {
        case '01':
          counter = this.FileType01Max;
          break;
        case '02':
          counter = this.FileType02Max;
          break;
        case '03':
          counter = this.FileType03Max;
          break;
        case '04':
          counter = this.FileType04Max;
          break;
        case '05':
          counter = this.FileType05Max;
          break;
        case '06':
          counter = this.FileType06Max;
          break;
      }
      if (counter == '00') {
        NewFileName = '10000015' + '_' + UploadTypeDesc + '_' + DateTime;
      } else {
        NewFileName = '10000015' + '_' + UploadTypeDesc + '_' + DateTime + '_' + counter;
      }
      counter++;
      return NewFileName;
    },
  });
});