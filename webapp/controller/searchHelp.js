sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"./designMode",
	"./messages",
	"com/shunyu/dzda/model/formatter"
], function (Object, Device, Filter, JSONModel, designMode, messages, formatter) {
	"use strict";

	return Object.extend("com.shunyu.dzda.controller.searchHelp", {
		formatter: formatter,

		constructor: function (oParentView) {
			this._oParentView = oParentView;
			this._oViewModel = this._oParentView.getModel();
			this._Controller = oParentView.getController();
			this._ResourceBundle = this._oParentView.getModel("i18n").getResourceBundle();
			this._ODataModel = this._oParentView.getModel("ZCommon");
		},

		openDialog: function () {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(this._oParentView.getId(), "com.shunyu.dzda.view.searchHelp", this);
				designMode.syncStyleClass(this._oParentView, this._oDialog);
				this._oParentView.addDependent(this._oDialog);
			}
			this._oViewModel.setProperty("/appProperties/f4panel", false);
			this._oDialog.open();

		},

		onSearch: function (evt) {
			var fcode = this._Controller._JSONModel.getProperty("/appProperties/fcode");
			var onSearchData = this._oParentView.getModel("onSearch").oData;
			var searchHelp = this._oViewModel.getProperty("/searchHelp"),
				VALUE1,
				KEY1;

			if (searchHelp.KEY1 !== '') {
				KEY1 = searchHelp.KEY1;
				this._oViewModel.setProperty("/searchHelp/Note1", KEY1);
			}
			if (searchHelp.VALUE1 !== '') {
				VALUE1 = searchHelp.VALUE1;
				this._oViewModel.setProperty("/searchHelp/Note1", VALUE1);
			}
			var oFilters = [];
			var sUrl = "/ZSY_HR_SH_COMMSet";
			var that = this;
			switch (fcode) {
				case "PERSK":
					oFilters.push(new Filter("FILTER1", sap.ui.model.FilterOperator.EQ, onSearchData.PERSG));
					break;
				case "DZDALB":
					oFilters.push(new Filter("FILTER1", sap.ui.model.FilterOperator.EQ, onSearchData.DZDAMK));
					break;
				default:
					if (onSearchData.WERKS !== '') {
						oFilters.push(new Filter("FILTER1", sap.ui.model.FilterOperator.EQ, onSearchData.WERKS));
					}
					break;
			}
			oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, this._oViewModel.getProperty("/appProperties/fcode")));
			if (searchHelp.KEY1 !== '') {
				oFilters.push(new Filter("KEY1", sap.ui.model.FilterOperator.EQ, KEY1));
			}
			if (searchHelp.VALUE1 !== '') {
				oFilters.push(new Filter("VALUE1", sap.ui.model.FilterOperator.EQ, VALUE1));
			}
			this._ODataModel.read(sUrl, { //
				filters: oFilters,
				success: function (oData, oResponse) {

					var oJson = oData.results;
					that._oViewModel.setProperty("/searchHelp/f4h2r", oJson);
					that._oViewModel.setSizeLimit(that._oViewModel.getProperty("/searchHelp/EMaxrecords"));
				},
				error: function (error) {
					that._oParentView.setBusy(false);
				}
			});
		},


		handleSearch: function (evt) {
			var aFilters = [];
			var afilter = [];
			var sValue = evt.getParameter("newValue");
			afilter.push(new Filter("Note1", sap.ui.model.FilterOperator.Contains, sValue));
			afilter.push(new Filter("Zvkey1", sap.ui.model.FilterOperator.Contains, sValue));
			// var oFilter = new Filter("Note1",
			// sap.ui.model.FilterOperator.Contains, sValue);
			var allFilters = new Filter(afilter, false); // false为并集
			aFilters.push(allFilters);
			var oBinding = this._oParentView.byId("LCGZ").getBinding("items");
			oBinding.filter(aFilters);
		},

		getTx: function (matnr) {
			var sUrl = "/ntzbSet";
			var oFilter1 = new sap.ui.model.Filter("EMatnr", sap.ui.model.FilterOperator.EQ, matnr);
			var aFilters = [
				oFilter1
			];
			var mParameters = {
				filters: aFilters,
				success: function (oData, response) {
					var Arry = oData.results;
					this._oViewModel.setProperty("/txb", Arry);
				}.bind(this),
				error: function (oError) {
					messages.showODataErrorText(oError);
					oDialog.close();
				}.bind(this)
			};
			this._ODataModel.read(sUrl, mParameters);
		},

		pressEvent: function (evt) {
			this._oDialog.close();
			var context = evt.getSource().getBindingContext();
			var item = context.getProperty(context.sPath);
			var fcode = this._oViewModel.getProperty("/appProperties/fcode");
			var oModelName = this._oViewModel.getProperty("/searchHelp/ModelName");
			var oPath = this._oViewModel.getProperty("/searchHelp/Path");
			var onSearchData = this._oParentView.getModel(oModelName).oData;
			var oTableData = this._oParentView.getModel(oModelName).oData;
			var oDzdaModel = this._oParentView.getModel("ZSY_HR_DZDA_SRV")
			switch (fcode) {
				case "PERNR":
					onSearchData.PERNR = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
					// case "PERNR":
					// 	this.oMultiPERNR.addToken(
					// 		new Token({
					// 			text: item.KEY1,
					// 			key: item.KEY1
					// 		})
					// 	);
					// 	break;
				case "WERKS":
					if (onSearchData.WERKS != item.KEY1) //说明选择的人事范围值发生了变化
					{
						onSearchData.BTRTL = "";
					}
					onSearchData.WERKS = item.KEY1;
					onSearchData.WERKST = item.VALUE1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "BTRTL":
					onSearchData.BTRTL = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "PERSG":
					if (onSearchData.PERSG != item.KEY1) //说明选择的员工组值发生了变化
					{
						onSearchData.PERSK = "";
					}
					onSearchData.PERSG = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "PERSK":
					onSearchData.PERSK = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "DZDAMK":
					if (onSearchData.DZDAMK != item.KEY1) //说明选择的模块值发生了变化
					{
						onSearchData.DZDALB = "";
					}
					onSearchData.DZDAMK = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "DZDALB":
					onSearchData.DZDALB = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "DZDAMKUP":
					if (onSearchData.DZDAMKUP != item.KEY1) //说明选择的模块值发生了变化
					{
						onSearchData.DZDALBUP = "";
						this._oParentView.setModel(new JSONModel({
							"content": ""
						}), "filetypes");
					}
					onSearchData.DZDAMKUP = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "DZDALBUP":
					if (onSearchData.DZDALBUP != item.KEY1) //说明选择的模块值发生了变化
					{
						var oFileUploader = this._oParentView.byId("fileUploader");
						var oDomRef = oFileUploader.getFocusDomRef();
						this._oParentView.setBusy(true);
						var oFilters = [],
							aFilterGroupsFilters = [];
						oFilters.push(new sap.ui.model.Filter(
							"Zlbid",
							sap.ui.model.FilterOperator.EQ,
							item.KEY1
						));
						aFilterGroupsFilters.push(new sap.ui.model.Filter(oFilters, true));
						oDzdaModel.read("/ZSY_HR_DZDAPZSet", {
							filters: aFilterGroupsFilters,
							success: function (oData, oResponse) {
								var oJson = oData.results;
								if (oJson.length > 0) {
									oDomRef.accept = oJson[0].Zfiletype; //设置打开的格式
									this._oParentView._filetype = oJson[0].Zfiletype;
									this._oParentView.setModel(new JSONModel({
										"content": "支持的文件格式 " + oJson[0].Zfiletype
									}), "filetypes");
								} else {
									oDomRef.accept = "*.*"; //未限制则默认都可以选
									this._oParentView._filetype = "*.*";
									this._oParentView.setModel(new JSONModel({
										"content": "支持的文件格式 *.*"
									}), "filetypes");
								}
								// console.log(oJson)
								this._oParentView.setBusy(false);
							}.bind(this),
							error: function (error) {
								this._oParentView.setBusy(false);
							}.bind(this)
						});
					}
					onSearchData.DZDALBUP = item.KEY1;
					onSearchData.DZDALBTUP = item.VALUE1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "ORG":
					onSearchData.ORG = item.KEY1;
					this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
			}

			this._oViewModel.setProperty("/searchHelp/KEY1", "");
			this._oViewModel.setProperty("/searchHelp/VALUE1", "");
			this._oViewModel.setProperty("/searchHelp/EMaxrecords", 500);
			// this._oParentView.byId("Zvkey1_Note1").clear();
			// this._Controller.setBusy(false);
		},

		pressSelectEvent: function (evt) {

			var context = evt.getSource().getBindingContext();
			var item = context.getProperty(context.sPath);
			var fcode = this._oViewModel.getProperty("/appProperties/fcode");
			if (fcode == "IvSmenr") {
				// 返利报表-柜组
				this.multiSelect(fcode);
			}
		},


		onSumbitAction: function () {
			var fcode = this._oViewModel.getProperty("/appProperties/fcode");
			this.multiSelect(fcode);
			this._oDialog.close();
			var oTable = this._oParentView.byId("GuiZu");
			oTable.setMode(sap.m.ListMode.Delete);
			oTable.setMode(sap.m.ListMode.MultiSelect);
		},

		setFCVisible: function (f) {
			if (f == "IvSmenr" || f == "Monat" || f == "KhinrFA" || f == "KostlFA" || f == "IpGdsdeptFA") {
				return false;
			}
			return true;
		},

		onCancelAction: function () {
			this._oDialog.close();
			this._oViewModel.setProperty("/searchHelp/KEY1", "");
			this._oViewModel.setProperty("/searchHelp/VALUE1", "");
			this._oViewModel.setProperty("/searchHelp/EMaxrecords", 500);
			// this._oParentView.byId("Zvkey1_Note1").clear();
			this._Controller.setBusy(false);
		},

		onPostSuccess: function (oController) {
			oController.getEventBus().publish("ZZCommon", "postExecuted", oController);
		}
	});
});