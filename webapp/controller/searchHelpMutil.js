sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"./designMode",
	"./messages",
	"../model/formatter",
	'sap/m/Token',
	"sap/m/MessageToast"
], function (Object, Device, Filter, JSONModel, designMode, messages, formatter, Token, MessageToast) {
	"use strict";

	return Object.extend("com.shunyu.dzda.controller.searchHelpMutil", {
		formatter: formatter,

		constructor: function (oParentView) {
			this._oParentView = oParentView;
			this._oViewModel = this._oParentView.getModel();
			this._Controller = oParentView.getController();
			this._ResourceBundle = this._oParentView.getModel("i18n").getResourceBundle();
			this._ODataModel = this._oParentView.getModel("oTy");
			this._ODzdaDataModel = this._oParentView.getModel("oDzdaTy");
			this.oMultiPERNR = this._oParentView.byId("PERNR");
			this.oMultiORG = this._oParentView.byId("ORG"); //部门
			this.oMultiPERSG = this._oParentView.byId("PERSG"); //员工组
			this.oMultiWERKS = this._oParentView.byId("WERKS"); //人事范围
			this.oMultiPERSK = this._oParentView.byId("PERSK"); //员工子组
			this.oMultiBTRTL = this._oParentView.byId("BTRTL"); //人事子范围
			this.oMultiZHR_CQ = this._oParentView.byId("ZHR_CQ"); //厂区
			this.oMultiZHR_ZT = this._oParentView.byId("ZHR_ZT"); //状态

		},

		openDialog: function () {
			if (!this._oDialogMutil) {
				this._oDialogMutil = sap.ui.xmlfragment(this._oParentView.getId(), "com.shunyu.dzda.view.searchHelpMutil", this);
				designMode.syncStyleClass(this._oParentView, this._oDialogMutil);
				this._oParentView.addDependent(this._oDialogMutil);
			}
			if (this._oViewModel.getProperty("/appProperties/fcode") == "PERNR_PRE") {
				this._oViewModel.setProperty("/appProperties/f4panel", true);
			} else {
				this._oViewModel.setProperty("/appProperties/f4panel", false);
			}
			this._oDialogMutil.open();

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
			if (fcode == "PERNR_PRE" || fcode == "ORG") {
				oFilters.push(new Filter("F4ID", sap.ui.model.FilterOperator.EQ, this._oViewModel.getProperty("/appProperties/fcode")));
				if (searchHelp.KEY1 !== '') {
					oFilters.push(new Filter("KEY1", sap.ui.model.FilterOperator.EQ, KEY1));
				}
				if (searchHelp.VALUE1 !== '') {
					oFilters.push(new Filter("VALUE1", sap.ui.model.FilterOperator.EQ, VALUE1));
				}
				var pFilters = [];
				for (var i = 0; i < this.oMultiWERKS.getTokens().length; i++) {
					pFilters.push(new sap.ui.model.Filter(
						"FILTER1",
						sap.ui.model.FilterOperator.EQ,
						this.oMultiWERKS.getTokens()[i].mProperties.key
					));
				}
				oFilters.push(new sap.ui.model.Filter(pFilters, false));

				this._ODzdaDataModel.read(sUrl, { //
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
			} else {
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
				var sUrl = "/ZSEARCH_HELPSet";
				var that = this;
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
						that._oViewModel.setSizeLimit(99999);
						// that._oViewModel.setSizeLimit(that._oViewModel.getProperty("/searchHelp/EMaxrecords"));
					},
					error: function (error) {
						that.getView().setBusy(false);
					}
				});
			}
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
			this._oDialogMutil.close();
			var context = evt.getSource().getBindingContext();
			var item = context.getProperty(context.sPath);
			var fcode = this._oViewModel.getProperty("/appProperties/fcode");
			var oModelName = this._oViewModel.getProperty("/searchHelp/ModelName");
			var oPath = this._oViewModel.getProperty("/searchHelp/Path");
			var onSearchData = this._oParentView.getModel(oModelName).oData;
			var oTableData = this._oParentView.getModel(oModelName).oData;
			var oFragmentData = this._oParentView.getModel(oModelName).oData;
			// var onFragment = this.onInitFragmentContract();
			switch (fcode) {
				case "PERNR_PRE":
					this.oMultiPERNR.addToken(
						new Token({
							text: item.KEY1,
							key: item.KEY1
						})
					);
					// onSearchData.PERNR = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "ORG":
					this.oMultiORG.addToken(
						new Token({
							text: item.KEY1,
							key: item.KEY1
						})
					);
					// onSearchData.ZHR_JRLY = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "WERKS":
					this.oMultiWERKS.addToken(
						new Token({
							text: item.KEY1,
							key: item.KEY1
						})
					);
					// onSearchData.WERKS = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "BTRTL_MUTIl":
					this.oMultiBTRTL.addToken(
						new Token({
							text: item.KEY1,
							key: item.KEY1
						})
					);
					// onSearchData.BTRTL = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "PERSG":
					this.oMultiPERSG.addToken(
						new Token({
							text: item.KEY1,
							key: item.KEY1
						})
					);
					// onSearchData.PERSG = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "PERSK_MUTIL":
					this.oMultiPERSK.addToken(
						new Token({
							text: item.KEY1,
							key: item.KEY1
						})
					);
					// onSearchData.PERSK = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "ZHR_CQ":
					this.oMultiZHR_CQ.addToken(
						new Token({
							text: item.KEY1,
							key: item.KEY1
						})
					);
					// onSearchData.ZHR_CQ = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "ZHR_ZT":
					this.oMultiZHR_ZT.addToken(
						new Token({
							text: item.KEY1,
							key: item.KEY1
						})
					);
					// onSearchData.ZHR_ZT = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "ZHR_SQLX":
					oTableData[oPath].ZHR_SQLX = item.KEY1;
					oTableData[oPath].ZHR_SQLX_DESC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData), oModelName);
					break;
				case "CTTYP":
					oTableData[oPath].CTTYP = item.KEY1;
					oTableData[oPath].CTTXT = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData), oModelName);
					break;
				case "FRAG_CTTYP":
					oFragmentData.CTTYP = item.KEY1;
					oFragmentData.CTTXT = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oFragmentData), oModelName);
					break;
				case "FRAG_ZZYRDW":
					oFragmentData.ZZYRDW = item.KEY1;
					oFragmentData.ZZYRDW_DESC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oFragmentData), oModelName);
					break;
				case "TAB_WERKS":
					oTableData[oPath].WERKS = item.KEY1;
					oTableData[oPath].NAME1 = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData), oModelName);
					break;
				case "TAB_PERSG":
					oTableData[oPath].PERSG = item.KEY1;
					oTableData[oPath].PTEXT = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData), oModelName);
					break;
				case "TAB_PERSK":
					oTableData[oPath].PERSK = item.KEY1;
					oTableData[oPath].PKTXT = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData), oModelName);
					break;
				case "TAB_BTRTL":
					oTableData[oPath].BTRTL = item.KEY1;
					oTableData[oPath].BTEXT = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData), oModelName);
					break;
				case "TAB_ZHR_SQLX":
					oTableData[oPath].ZHR_SQLX = item.KEY1;
					oTableData[oPath].ZHR_SQLX_DESC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData), oModelName);
					break;
				case "TAB_ZZYRDW":
					oTableData[oPath].ZZYRDW = item.KEY1;
					oTableData[oPath].ZZYRDW_DESC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData), oModelName);
					break;
				case "TAB_ZHR_CQ":
					oTableData[oPath].ZHR_CQ = item.KEY1;
					oTableData[oPath].ZHR_CQ_DESC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData), oModelName);
					break;
				case "TAB_ZHR_SS":
					oTableData[oPath].ZHR_SS = item.KEY1;
					oTableData[oPath].ZHR_SSMC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oTableData), oModelName);
					break;
				case "FRAG_ZHR_SS":
					oFragmentData.ZHR_SS = item.KEY1;
					oFragmentData.ZHR_SQLX_DESC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oFragmentData), oModelName);
					break;
				case "FRAG_ZHR_SQLX":
					oFragmentData.ZHR_SQLX = item.KEY1;
					oFragmentData.ZHR_SSMC = item.VALUE1;
					this._oParentView.setModel(new JSONModel(oFragmentData), oModelName);
					break;
			}

			this._oViewModel.setProperty("/searchHelp/KEY1", "");
			this._oViewModel.setProperty("/searchHelp/VALUE1", "");
			this._oViewModel.setProperty("/searchHelp/EMaxrecords", 500);
			// this._oParentView.byId("Zvkey1_Note1").clear();
			this._Controller.setBusy(false);
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
			this._oDialogMutil.close();
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
		onConfirmAction: function (evt) {

			// var context = evt.getSource().getBindingContext();
			// var item = context.getProperty(context.sPath);
			var fcode = this._oViewModel.getProperty("/appProperties/fcode");
			// var oModelName = this._oViewModel.getProperty("/searchHelp/ModelName");
			// var oPath = this._oViewModel.getProperty("/searchHelp/Path");
			// var onSearchData = this._oParentView.getModel(oModelName).oData;
			// var oTableData = this._oParentView.getModel(oModelName).oData;
			// var oFragmentData = this._oParentView.getModel(oModelName).oData;
			var oTable = this._oParentView.byId("MutilTable");
			var oItems = oTable.getSelectedItems();
			if (oItems.length <= 0) {
				MessageToast.show("请至少选中一行");
				return;
			}
			this._oDialogMutil.close();
			// var onFragment = this.onInitFragmentContract();
			switch (fcode) {
				case "PERNR_PRE":
					this.oMultiPERNR.removeAllTokens();
					for (var i = 0; i < oItems.length; i++) {
						this.oMultiPERNR.addToken(
							new Token({
								text: oItems[i].getBindingContext().getProperty("KEY1"),
								key: oItems[i].getBindingContext().getProperty("KEY1")
							})
						);
					}

					// onSearchData.PERNR = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "ORG":
					this.oMultiORG.removeAllTokens();
					for (var i = 0; i < oItems.length; i++) {
						this.oMultiORG.addToken(
							new Token({
								text: oItems[i].getBindingContext().getProperty("KEY1"),
								key: oItems[i].getBindingContext().getProperty("KEY1")
							})
						);
					}
					// onSearchData.ZHR_JRLY = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "WERKS":
					this.oMultiWERKS.removeAllTokens();
					for (var i = 0; i < oItems.length; i++) {
						this.oMultiWERKS.addToken(
							new Token({
								text: oItems[i].getBindingContext().getProperty("KEY1"),
								key: oItems[i].getBindingContext().getProperty("KEY1")
							})
						);
					}
					// onSearchData.WERKS = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "BTRTL_MUTIl":
					this.oMultiBTRTL.removeAllTokens();
					for (var i = 0; i < oItems.length; i++) {
						this.oMultiBTRTL.addToken(
							new Token({
								text: oItems[i].getBindingContext().getProperty("KEY1"),
								key: oItems[i].getBindingContext().getProperty("KEY1")
							})
						);
					}
					// onSearchData.BTRTL = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "PERSG":
					this.oMultiPERSG.removeAllTokens();
					for (var i = 0; i < oItems.length; i++) {
						this.oMultiPERSG.addToken(
							new Token({
								text: oItems[i].getBindingContext().getProperty("KEY1"),
								key: oItems[i].getBindingContext().getProperty("KEY1")
							})
						);
					}
					// onSearchData.PERSG = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "PERSK_MUTIL":
					this.oMultiPERSK.removeAllTokens();
					for (var i = 0; i < oItems.length; i++) {
						this.oMultiPERSK.addToken(
							new Token({
								text: oItems[i].getBindingContext().getProperty("KEY1"),
								key: oItems[i].getBindingContext().getProperty("KEY1")
							})
						);
					}
					// onSearchData.PERSK = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "ZHR_CQ":
					this.oMultiZHR_CQ.removeAllTokens();
					for (var i = 0; i < oItems.length; i++) {
						this.oMultiZHR_CQ.addToken(
							new Token({
								text: oItems[i].getBindingContext().getProperty("KEY1"),
								key: oItems[i].getBindingContext().getProperty("KEY1")
							})
						);
					}
					// onSearchData.ZHR_CQ = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
				case "ZHR_ZT":
					this.oMultiZHR_ZT.removeAllTokens();
					for (var i = 0; i < oItems.length; i++) {
						this.oMultiZHR_ZT.addToken(
							new Token({
								text: oItems[i].getBindingContext().getProperty("KEY1"),
								key: oItems[i].getBindingContext().getProperty("KEY1")
							})
						);
					}
					// onSearchData.ZHR_ZT = item.KEY1;
					// this._oParentView.setModel(new JSONModel(onSearchData), oModelName);
					break;
			}

			this._oViewModel.setProperty("/searchHelp/KEY1", "");
			this._oViewModel.setProperty("/searchHelp/VALUE1", "");
			this._oViewModel.setProperty("/searchHelp/EMaxrecords", 500);
			// this._oParentView.byId("Zvkey1_Note1").clear();
			this._Controller.setBusy(false);
		},
		onCancelAction: function () {
			this._oDialogMutil.close();
			this._oViewModel.setProperty("/searchHelp/KEY1", "");
			this._oViewModel.setProperty("/searchHelp/VALUE1", "");
			this._oViewModel.setProperty("/searchHelp/EMaxrecords", 500);
			// this._oParentView.byId("Zvkey1_Note1").clear();
			this._Controller.setBusy(false);
		},

		onPostSuccess: function (oController) {
			oController.getEventBus().publish("ZPreEntry", "postExecuted", oController);
		}
	});
});