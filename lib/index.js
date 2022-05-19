"use strict";

import React, { PureComponent } from "react";
import {
  StyleSheet,
  FlatList,
  // Image,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import IconFA from 'react-native-vector-icons/FontAwesome5';
import { addDays, format, formatDistance, formatDistanceStrict } from "date-fns";
import { enCA, enAU, enUS, et, ptBR } from "date-fns/locale";

const defaultCircleSize = 16;
const defaultCircleColor = "#007AFF";
const defaultLineWidth = 2;
const defaultLineColor = "#007AFF";
const defaultTimeTextColor = "black";
const defaultDotColor = "white";
const defaultInnerCircle = "none";

export default class Timeline extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._renderItem = this._renderItem.bind(this);
    this.renderTime = (
      this.props.renderTime ? this.props.renderTime : this._renderTime
    ).bind(this);
    this.renderDetail = (
      this.props.renderDetail ? this.props.renderDetail : this._renderDetail
    ).bind(this);
    this.renderCircle = (
      this.props.renderCircle ? this.props.renderCircle : this._renderCircle
    ).bind(this);
    this.renderEvent = this._renderEvent.bind(this);

    this.state = {
      data: this.props.data,
      //dataSource: ds.cloneWithRows(this.props.data),
      x: 0,
      width: 0,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.data !== nextProps.data) {
      return {
        data: nextProps.data,
      };
    }

    return null;
  }

  render() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.container, this.props.style]}
      >
        <FlatList
          showsVerticalScrollIndicator={false}
          style={[styles.listview, this.props.listViewStyle]}
          data={this.state.data}
          extraData={this.state}
          renderItem={this._renderItem}
          keyExtractor={(item, index) => index + ""}
          {...this.props.options}
        />
      </ScrollView>
    );
  }

  _renderItem({ item, index }) {
    let content = null;
    switch (this.props.columnFormat) {
      case "single-column-left":
        content = (
          <View style={[styles.rowContainer, this.props.rowContainerStyle]}>
            {this.renderTime(item, index)}
            {this.renderEvent(item, index)}
            {this.renderCircle(item, index)}
          </View>
        );
        break;
      case "single-column-right":
        content = (
          <View style={[styles.rowContainer, this.props.rowContainerStyle]}>
            {this.renderEvent(item, index)}
            {this.renderTime(item, index)}
            {this.renderCircle(item, index)}
          </View>
        );
        break;
      case "two-column":
        content =
          (item.position && item.position == "right") ||
          (!item.position && index % 2 == 0) ? (
            <View style={[styles.rowContainer, this.props.rowContainerStyle]}>
              {this.renderTime(item, index)}
              {this.renderEvent(item, index)}
              {this.renderCircle(item, index)}
            </View>
          ) : (
            <View style={[styles.rowContainer, this.props.rowContainerStyle]}>
              {this.renderEvent(item, index)}
              {this.renderTime(item, index)}
              {this.renderCircle(item, index)}
            </View>
          );
        break;
    }
    return <View key={index}>{content}</View>;
  }

  _renderTime(rowData, rowID) {
    if (!this.props.showTime) {
      return null;
    }
    var timeWrapper = null;
    switch (this.props.columnFormat) {
      case "single-column-left":
        timeWrapper = {
          alignItems: "flex-end",
        };
        break;
      case "single-column-right":
        timeWrapper = {
          alignItems: "flex-start",
        };
        break;
      case "two-column":
        timeWrapper = {
          flex: 1,
          alignItems:
            (rowData.position && rowData.position == "right") ||
            (!rowData.position && rowID % 2 == 0)
              ? "flex-end"
              : "flex-start",
        };
        break;
    }
    return (
      <View style={timeWrapper}>
        <View style={[styles.timeContainer, this.props.timeContainerStyle]}>
          <Text style={[styles.time, this.props.timeStyle]}>
            {rowData.time}
          </Text>
        </View>
      </View>
    );
  }

  _renderEvent(rowData, rowID) {
    const lineWidth = rowData.lineWidth
      ? rowData.lineWidth
      : this.props.lineWidth;
    const isLast = this.props.renderFullLine
      ? !this.props.renderFullLine
      : this.state.data.slice(-1)[0] === rowData;
    const lineColor = isLast
      ? "rgba(0,0,0,0)"
      : rowData.lineColor
      ? rowData.lineColor
      : this.props.lineColor;
    let opStyle = null;

    switch (this.props.columnFormat) {
      case "single-column-left":
        opStyle = {
          borderColor: lineColor,
          borderLeftWidth: lineWidth,
          borderRightWidth: 0,
          marginLeft: 20,
          paddingLeft: 20,
        };
        break;
      case "single-column-right":
        opStyle = {
          borderColor: lineColor,
          borderLeftWidth: 0,
          borderRightWidth: lineWidth,
          marginRight: 20,
          paddingRight: 20,
        };
        break;
      case "two-column":
        opStyle =
          (rowData.position && rowData.position == "right") ||
          (!rowData.position && rowID % 2 == 0)
            ? {
                borderColor: lineColor,
                borderLeftWidth: lineWidth,
                borderRightWidth: 0,
                marginLeft: 20,
                paddingLeft: 20,
              }
            : {
                borderColor: lineColor,
                borderLeftWidth: 0,
                borderRightWidth: lineWidth,
                marginRight: 20,
                paddingRight: 20,
              };
        break;
    }

    return (
      <View
        style={[styles.details, opStyle]}
        onLayout={(evt) => {
          if (!this.state.x && !this.state.width) {
            const { x, width } = evt.nativeEvent.layout;
            this.setState({ x, width });
          }
        }}
      >
        <TouchableOpacity
          disabled={rowData.type === 0 || rowData.type === 100 || this.props.onEventPress == null}
          style={[this.props.detailContainerStyle]}
          onPress={() =>
            this.props.onEventPress ? this.props.onEventPress(rowData) : null
          }
        >
          <View style={styles.detail}>{this.renderDetail(rowData, rowID)}</View>
          {this._renderSeparator()}
        </TouchableOpacity>
      </View>
    );
  }

  normalizeTxCurrency(coin, prices) {
    if (prices[this.props.currency]) {
      return this.props.currency;
    } else {
      return coin.currency;
    }

    // if (!coin.has_currencies) {
    //   return coin.currency;
    // } else {
    //   return this.props.currency;
    // }
  }

  normalizeTxValue(amount) {
    if (amount >= 1 || amount === 0 || amount < 0.000001) {
      return amount.toFixed(2);
    } else {
      return amount.toFixed(6);
    }
  }

  _renderDetail(rowData, rowID) {
    let title = null;
    if (rowData.type === 0) {
      title = (
        <View>
          <View style={[styles.containerTitleLoad]}>
            <ShimmerPlaceHolder
              height={20}
              // width={120}
              // autoRun={true}
              style={styles.titleLoad}
            />
            <ShimmerPlaceHolder
              height={20}
              width={90}
              // autoRun={true}
              style={styles.dateLoad}
            />
          </View>
          <ShimmerPlaceHolder
            height={25}
            width={180}
            // autoRun={true}
            style={styles.dataLoad}
          />
          <ShimmerPlaceHolder
            height={25}
            width={150}
            // autoRun={true}
            style={styles.dataLoad}
          />
          {/* <Text style={[styles.address]}>
            {rowData.address ? rowData.address : ''}
          </Text>
          <Text style={[styles.value]}>
            {rowData.value ? `${rowData.value} ${rowData.coin}` : ''}
          </Text>
          <Text style={[styles.fee]}>
            {rowData.gasUsed
              ? `Taxa: ${rowData.gasUsed} ${
                  rowData.coin === 'OMNES' ? 'ETH' : rowData.coin
                }`
              : ''}
          </Text> */}
          {/* <Text style={[styles.description, this.props.descriptionStyle]}>
          {rowData.description}
        </Text> */}
        </View>
      );
    } else if (rowData.type === 100) {
      title = (
        <View>
          <View style={[styles.containerTitleLoad]}>
            <ShimmerPlaceHolder
              height={20}
              // width={120}
              // autoRun={true}
              style={styles.titleLoad}
            />
            <ShimmerPlaceHolder
              height={20}
              width={90}
              // autoRun={true}
              style={styles.dateLoad}
            />
          </View>
          <ShimmerPlaceHolder
            height={25}
            width={180}
            // autoRun={true}
            style={styles.dataLoad}
          />
          <ShimmerPlaceHolder
            height={25}
            width={150}
            // autoRun={true}
            style={styles.dataLoad}
          />
           <ShimmerPlaceHolder
            height={25}
            width={150}
            // autoRun={true}
            style={styles.dataLoad}
          />
          {/* <Text style={[styles.address]}>
            {rowData.address ? rowData.address : ''}
          </Text>
          <Text style={[styles.value]}>
            {rowData.value ? `${rowData.value} ${rowData.coin}` : ''}
          </Text>
          <Text style={[styles.fee]}>
            {rowData.gasUsed
              ? `Taxa: ${rowData.gasUsed} ${
                  rowData.coin === 'OMNES' ? 'ETH' : rowData.coin
                }`
              : ''}
          </Text> */}
          {/* <Text style={[styles.description, this.props.descriptionStyle]}>
          {rowData.description}
        </Text> */}
        </View>
      );
    } else {
      title = (
        <View>
          <View style={[styles.containerTitle]}>
            <Text style={[this.props.darkMode ? stylesDark.title : styles.title, this.props.titleStyle]}>
              {rowData.type === 1
                ? this.props.translate.t(rowData.is_chargeback ? "titleTxChargeback" : "titleTxReceive")
                : rowData.type === 2
                ? this.props.translate.t("titleTxTransfer")
                : [3, 28].includes(rowData.type)
                ? this.props.translate.t(
                    rowData.is_deposit_fee ? "titleTxDepositFee" : rowData.is_swap_fee ? "titleTxSwapFee" : "titleTxFee"
                  )
                : [60].includes(rowData.type)
                ? this.props.translate.t("titleTxPay")
                : rowData.type === 5
                ? this.props.translate.t("titleTxDepositStaking")
                : rowData.type === 6
                ? this.props.translate.t("titleTxWithdrawStaking")
                : rowData.type === 4
                ? this.props.translate.t("titleActivationStaking")
                : rowData.type === 7
                ? this.props.translate.t("titleActivationSwap")
                : rowData.type === 8
                ? this.props.translate.t("titleTxSwap")
                : rowData.type === 9
                ? this.props.translate.t("titleTxCardRecharge")
                : rowData.type === 10
                ? this.props.translate.t("titleTxReceivement")
                : rowData.type === 11
                ? this.props.translate.t("titleTxCardPurchase")
                : rowData.type === 12
                ? this.props.translate.t("titleTxPurchase")
                : rowData.type === 13
                ? this.props.translate.t("titleTxRequestCard")
                : rowData.type === 14
                ? this.props.translate.t("titleTxActivationCard")
                : rowData.type === 15
                ? this.props.translate.t("titleTxCardWithdraw")
                : rowData.type === 16
                ? this.props.translate.t("titleTxConversion")
                : rowData.type === 17
                ? this.props.translate.t("titleTxConversion")
                : rowData.type === 19
                ? this.props.translate.t("titleTxPay")
                : rowData.type === 21
                ? this.props.translate.t("titleTxDepositOrder")
                : rowData.type === 22
                ? this.props.translate.t("titleTxWithdrawOrder")
                : rowData.type === 23
                ? this.props.translate.t("titleTxTransfer")
                : rowData.type === 24
                ? this.props.translate.t("titleTxReceive")
                : rowData.type === 25
                ? this.props.translate.t("titleTxCashback")
                : rowData.type === 26
                ? this.props.translate.t("titleTxCashback2")
                : rowData.type === 27
                ? this.props.translate.t("titleTxCashback3")
                : rowData.type === 29
                ? this.props.translate.t("titleTxMintNft")
                : this.props.translate.t("titleTxRecharge")}
            </Text>

            <Text style={[this.props.darkMode ? stylesDark.date : styles.date]}>
              {rowData.created_at
                ? rowID === 0
                  ? formatDistance(new Date(rowData.created_at), new Date(), {
                      locale:
                        this.props.language === "portuguese" ? ptBR : enUS,
                      addSuffix: true,
                    })
                  : format(new Date(rowData.created_at), "dd MMM yy, HH:mm", {
                      locale:
                        this.props.language === "portuguese" ? ptBR : enUS,
                    })
                : // formatDistanceStrict(
                  //   new Date(rowData.created_at),
                  //   new Date(),
                  //   {
                  //     unit: 'month',
                  //     locale: ptBR,
                  //   },
                  // )
                  // formatDistance(new Date(rowData.created_at), new Date(), {
                  //   locale: ptBR,
                  // })
                  // format(new Date(rowData.created_at), 'dd MMM yy', {
                  //   locale: ptBR,
                  // })
                  ""}
              {/* {rowData.created_at ? rowData.date.join(' ') : ''} */}
            </Text>
          </View>
          <Text style={[this.props.darkMode ? stylesDark.who : styles.who]}>
            {rowData.type === 23
              ? rowData.to_name
              : rowData.type === 24
              ? rowData.from_name
              : [19].includes(rowData.type)
              ? rowData.beneficiary ? rowData.beneficiary : this.props.translate.t("toAddress")
              : rowData.from_name
              ? rowData.from_address
              : rowData.to_name
              ? rowData.to_address
              : rowData.company_name
              ? rowData.company_name
              : rowData.type === 1
              ? rowData.is_chargeback ? rowData.establishment.name : rowData.from_address
                ? rowData.from_address
                : this.props.translate.t("fromAddress")
              : [2, 5, 6, 16, 17, 27].includes(rowData.type)
              ? rowData.to_address
              : [3, 28].includes(rowData.type)
              ? rowData.is_deposit_fee
                ? this.props.translate.t("toZefi")
                : this.props.language === "portuguese"
                ? `${this.props.translate.t("toNetwork")} ${rowData.coin.name}`
                : `${rowData.coin.name} ${this.props.translate.t("toNetwork")}`
              : rowData.type === 4
              ? rowData.coin_pool.symbol
              : rowData.type === 7
              ? rowData.coin_swap.symbol
              : [8, 9, 14].includes(rowData.type)
              ? this.props.translate.t("toZefi")
              : rowData.type === 10
              ? rowData.receiver
              : [11, 15].includes(rowData.type)
              ? rowData.establishment.name
              : rowData.type === 12
              ? rowData.from_address
              : rowData.type === 13
              ? this.props.translate.t("physicalCard")
              : [21].includes(rowData.type)
              ? `${rowData.status === 1 ? "⌛" : rowData.status === 2 ? "✅" : rowData.status === 3 ? "❌" : rowData.status === 4 ? "❌" : "⌛"} ${this.props.translate.t(rowData.status === 1 ? "statusDepositOrderPending" : rowData.status === 2 ? "statusDepositOrderApproved" : rowData.status === 3 ? "statusDepositOrderCanceled" : rowData.status === 4 ? "statusDepositOrderDisapproved" : "statusDepositOrderDisapproved")}` 
              : [22].includes(rowData.type)
              ? `${[1, 2, 3].includes(rowData.status) ? "⌛" : rowData.status === 5 ? "✅" : rowData.status === 4 ? "❌" : "⌛"} ${this.props.translate.t([1, 2, 3].includes(rowData.status) ? "statusDepositOrderPending" : rowData.status === 5 ? "statusDepositOrderApproved" : rowData.status === 4 ? "statusDepositOrderDisapproved" : "statusDepositOrderDisapproved")}` 
              : [25, 26].includes(rowData.type)
              ? `${this.props.translate.t("availableCashback")} ${format(addDays(new Date(rowData.created_at), 30), "dd MMM yy", { locale: this.props.language === "portuguese" ? ptBR : enUS })}` 
              : [29].includes(rowData.type)
              ? `${[1, 2, 3].includes(rowData.status) ? "⌛" : rowData.status === 5 ? rowData.eth_address : rowData.status === 4 ? "❌" : "⌛"} ${this.props.translate.t([1, 2, 3].includes(rowData.status) ? "statusDepositOrderPending" : rowData.status === 5 ? "" : rowData.status === 4 ? "statusDepositOrderDisapproved" : "statusDepositOrderDisapproved")}`
              : ""}
          </Text>

          {[25, 26].includes(rowData.type) ? (
            <React.Fragment>
              <Text style={[this.props.darkMode ? stylesDark.value : styles.value]}>
                {/* {rowData.type !== 12
                  ? this.props.normalizeCurrency[
                    this.normalizeTxCurrency(rowData.coin, rowData.prices)
                  ]
                  : ""
                }{rowData.type !== 12 ? " " : ""} */}
                {/* {rowData.type === 1
                  ? this.normalizeTxValue(
                      rowData.amount *
                        rowData.prices[
                          this.normalizeTxCurrency(rowData.coin, rowData.prices)
                        ]
                    )
                  : [2, 3].includes(rowData.type)
                  ? this.normalizeTxValue(
                      Math.abs(rowData.amount) *
                        rowData.prices[
                          this.normalizeTxCurrency(rowData.coin, rowData.prices)
                        ]
                    )
                  : [5, 6, 7].includes(rowData.type)
                  ? !rowData.coin.has_currencies ||
                    this.props.currency === "brl"
                    ? this.normalizeTxValue(rowData.amount / 100)
                    : this.normalizeTxValue(
                        Math.abs(rowData.value) *
                          rowData.selling_prices[
                            this.normalizeTxCurrency(rowData.coin, rowData.prices)
                          ]
                      )
                  : [4, 10].includes(rowData.type)
                  ? this.normalizeTxValue(
                      Math.abs(rowData.value) *
                        rowData.selling_prices[
                          this.normalizeTxCurrency(rowData.coin, rowData.prices)
                        ]
                    )
                  : [25].includes(rowData.type)
                  ? this.normalizeTxValue(
                      Math.abs(rowData.value) *
                        rowData.selling_prices[
                          this.normalizeTxCurrency(rowData.coin, rowData.prices)
                        ]
                    )
                  : ""} */}
                {/* {rowData.type === 12 ? `${this.normalizeTxValue(Math.abs(rowData.amount))} ${rowData.coin.symbol}` : ` (${this.normalizeTxValue(
                  rowData.type === 1 ? rowData.amount : Math.abs(rowData.amount)
                )} ${rowData.coin.symbol})`} */}
                {this.props.translate.t("receiveCashback")}{": "}
                {rowData.type === 14 ? this.props.translate.t("physicalCard") : this.normalizeTxValue(
                  [25, 26].includes(rowData.type) ? (Math.abs(rowData.amount) * rowData.prices.zefi) : rowData.type === 19 ? Math.abs(rowData.amount) : rowData.type === 1 ? rowData.amount : [6, 17].includes(rowData.type) ? rowData.type === 6 && rowData.stage === 2 && !rowData.is_all ? Math.abs(rowData.rewards) : Math.abs(rowData.withdrawal_amount) : [2, 8, 15].includes(rowData.type) ? Math.abs(rowData.amount) - rowData.fee : [5].includes(rowData.type) && rowData.stage === 2 ? Math.abs(rowData.deposit_amount) : Math.abs(rowData.amount)
                )}{" "}
                {[25, 26].includes(rowData.type) ? "ZEFI" : rowData.type === 19 ? "BRL" : rowData.type === 14 ? "" : [9, 11, 13, 15].includes(rowData.type) || rowData.transaction_type === "chargeback" ? "BRL" : rowData.type === 6 && rowData.stage === 2 && !rowData.is_all ? "zvZEFI" : rowData.stage === 2 || rowData.type === 17 ? rowData.coin.symbol2 : rowData.coin.symbol}
                {` (${rowData.cashback_percentage}%)`}
                {/* {[25, 26].includes(rowData.type) ? " - " : ""}
                {[25, 26].includes(rowData.type) ? (this.normalizeTxValue(Math.abs(rowData.amount) * rowData.prices.zefi)) : ""}
                {[25, 26].includes(rowData.type) ? "ZEFI" : ""} */}
                {/* ["RAS", "LQX"].includes(rowData.coin.symbol) */}
              </Text>
              <Text style={[this.props.darkMode ? stylesDark.value2 : styles.value2]}>
                {/* {[25, 26].includes(rowData.type) ? " - " : ""} */}
                {this.props.translate.t("currentCashback")}{": "}
                {[25, 26].includes(rowData.type) ? (this.normalizeTxValue(Math.abs(rowData.amount) * rowData.coin.prices.zefi)) : ""}{" "}
                {[25, 26].includes(rowData.type) ? "ZEFI" : ""}
              </Text>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Text style={[this.props.darkMode ? stylesDark.value : styles.value]}>
                {/* {rowData.type !== 12
                  ? this.props.normalizeCurrency[
                    this.normalizeTxCurrency(rowData.coin, rowData.prices)
                  ]
                  : ""
                }{rowData.type !== 12 ? " " : ""} */}
                {/* {rowData.type === 1
                  ? this.normalizeTxValue(
                      rowData.amount *
                        rowData.prices[
                          this.normalizeTxCurrency(rowData.coin, rowData.prices)
                        ]
                    )
                  : [2, 3].includes(rowData.type)
                  ? this.normalizeTxValue(
                      Math.abs(rowData.amount) *
                        rowData.prices[
                          this.normalizeTxCurrency(rowData.coin, rowData.prices)
                        ]
                    )
                  : [5, 6, 7].includes(rowData.type)
                  ? !rowData.coin.has_currencies ||
                    this.props.currency === "brl"
                    ? this.normalizeTxValue(rowData.amount / 100)
                    : this.normalizeTxValue(
                        Math.abs(rowData.value) *
                          rowData.selling_prices[
                            this.normalizeTxCurrency(rowData.coin, rowData.prices)
                          ]
                      )
                  : [4, 10].includes(rowData.type)
                  ? this.normalizeTxValue(
                      Math.abs(rowData.value) *
                        rowData.selling_prices[
                          this.normalizeTxCurrency(rowData.coin, rowData.prices)
                        ]
                    )
                  : [25].includes(rowData.type)
                  ? this.normalizeTxValue(
                      Math.abs(rowData.value) *
                        rowData.selling_prices[
                          this.normalizeTxCurrency(rowData.coin, rowData.prices)
                        ]
                    )
                  : ""} */}
                {/* {rowData.type === 12 ? `${this.normalizeTxValue(Math.abs(rowData.amount))} ${rowData.coin.symbol}` : ` (${this.normalizeTxValue(
                  rowData.type === 1 ? rowData.amount : Math.abs(rowData.amount)
                )} ${rowData.coin.symbol})`} */}
                {rowData.type === 14 ? this.props.translate.t("physicalCard") : this.normalizeTxValue(
                  [21, 29].includes(rowData.type) ? Math.abs(rowData.deposit_amount) : [22].includes(rowData.type) ? Math.abs(rowData.receive_amount) : [25, 26, 27].includes(rowData.type) ? (Math.abs(rowData.amount) * rowData.prices.zefi) : rowData.type === 19 ? Math.abs(rowData.amount) : rowData.type === 1 ? rowData.amount : [6, 17].includes(rowData.type) ? rowData.type === 6 && rowData.stage === 2 && !rowData.is_all ? Math.abs(rowData.rewards) : Math.abs(rowData.withdrawal_amount) : [2, 8, 15].includes(rowData.type) ? Math.abs(rowData.amount) - rowData.fee : [5].includes(rowData.type) && rowData.stage === 2 ? Math.abs(rowData.deposit_amount) : Math.abs(rowData.amount)
                )}{" "}
                {[25, 26, 27].includes(rowData.type) ? "ZEFI" : [19, 21, 23, 24, 29].includes(rowData.type) ? "BRL" : rowData.type === 14 ? "" : [9, 11, 13, 15].includes(rowData.type) || rowData.transaction_type === "chargeback" ? "BRL" : rowData.type === 6 && rowData.stage === 2 && !rowData.is_all ? "zvZEFI" : rowData.stage === 2 || rowData.type === 17 ? rowData.coin.symbol2 : rowData.coin.symbol}
                
                {[21, 22, 29].includes(rowData.type) ? " " : ""}
                {[21].includes(rowData.type) ? rowData.coin_receive.is_token ? `(${this.normalizeTxValue(Math.abs(rowData.receive_amount))} ${rowData.coin_receive.symbol})` : `(${this.props.translate.t("defineBNB")})` : [22].includes(rowData.type) ? `(${this.normalizeTxValue(Math.abs(rowData.receive_amount))} ${"BRL"})` : [29].includes(rowData.type) ? `(${rowData.nfts_amount} ${rowData.nfts_amount > 1 ? "NFTs" : "NFT"})` : ""}
                {/* {[25, 26].includes(rowData.type) ? " - " : ""}
                {[25, 26].includes(rowData.type) ? (this.normalizeTxValue(Math.abs(rowData.amount) * rowData.prices.zefi)) : ""}
                {[25, 26].includes(rowData.type) ? "ZEFI" : ""} */}
                {/* ["RAS", "LQX"].includes(rowData.coin.symbol) */}
              </Text>
            </React.Fragment>
          )}

          {/* <Text style={[styles.fee]}>
            {rowData.gasUsed
              ? `Taxa: ${rowData.gasUsed} ${
                  rowData.coin === 'OMNES' ? 'ETH' : rowData.coin
                }`
              : ''}
          </Text> */}
          {/* <Text style={[styles.description, this.props.descriptionStyle]}>
          {rowData.description}
        </Text> */}
        </View>
      );
    }

    // let title = rowData.action ? (
    //   <View>
    //     <View style={[styles.containerTitle]}>
    //       <Text style={[styles.title, this.props.titleStyle]}>
    //         {rowData.action === "send"
    //           ? "Transferência enviada"
    //           : "Transferência recebida"}
    //       </Text>
    //       <Text style={[styles.date]}>
    //         {rowData.date ? rowData.date.join(" ") : ""}
    //       </Text>
    //     </View>
    //     <Text style={[styles.address]}>
    //       {rowData.address ? rowData.address : ""}
    //     </Text>
    //     <Text style={[styles.value]}>
    //       {rowData.value ? `${rowData.value} ${rowData.coin}` : ""}
    //     </Text>
    //     <Text style={[styles.fee]}>
    //       {rowData.gasUsed
    //         ? `Taxa: ${rowData.gasUsed} ${
    //             rowData.coin === "OMNES" ? "ETH" : rowData.coin
    //           }`
    //         : ""}
    //     </Text>
    //     {/* <Text style={[styles.description, this.props.descriptionStyle]}>
    //       {rowData.description}
    //     </Text> */}
    //   </View>
    // ) : (
    //   <Text style={[styles.title, this.props.titleStyle]}>{}</Text>
    // );
    return <View style={styles.container}>{title}</View>;
  }

  _renderCircle(rowData, rowID) {
    var circleSize = rowData.circleSize
      ? rowData.circleSize
      : this.props.circleSize
      ? this.props.circleSize
      : defaultCircleSize;
    var circleColor = rowData.circleColor
      ? rowData.circleColor
      : this.props.circleColor
      ? this.props.circleColor
      : defaultCircleColor;
    var lineWidth = rowData.lineWidth
      ? rowData.lineWidth
      : this.props.lineWidth
      ? this.props.lineWidth
      : defaultLineWidth;

    var circleStyle = null;

    switch (this.props.columnFormat) {
      case "single-column-left":
        circleStyle = {
          width: this.state.x ? circleSize : 0,
          height: this.state.x ? circleSize : 0,
          borderRadius: circleSize / 2,
          backgroundColor: circleColor,
          left: this.state.x - circleSize / 2 + (lineWidth - 1) / 2,
        };
        break;
      case "single-column-right":
        circleStyle = {
          width: this.state.width ? circleSize : 0,
          height: this.state.width ? circleSize : 0,
          borderRadius: circleSize / 2,
          backgroundColor: circleColor,
          left: this.state.width - circleSize / 2 - (lineWidth - 1) / 2,
        };
        break;
      case "two-column":
        circleStyle = {
          width: this.state.width ? circleSize : 0,
          height: this.state.width ? circleSize : 0,
          borderRadius: circleSize / 2,
          backgroundColor: circleColor,
          left: this.state.width - circleSize / 2 - (lineWidth - 1) / 2,
        };
        break;
    }

    var innerCircle = null;
    switch (this.props.innerCircle) {
      case "icon":
        // let iconDefault = rowData.iconDefault
        //   ? rowData.iconDefault
        //   : this.props.iconDefault;
        // let iconSource = rowData.icons ? rowData.icons : iconDefault;
        // if (rowData.action)
        //   //   iconSource =
        //   //     rowData.icon.constructor === String
        //   //       ? { uri: rowData.icon }
        //   //       : rowData.icon;
        //   iconSource =
        //     rowData.action === "send"
        //       ? this.props.icons.send
        //       : this.props.icons.receive;
        // let iconStyle = {
        //   height: circleSize,
        //   width: circleSize
        // };
        if (rowData.type === 0 || rowData.type === 100) {
          innerCircle = (
            <ShimmerPlaceHolder
              height={circleSize}
              width={circleSize}
              // autoRun={true}
              style={styles.load}
            />
          );
        } else if ([1, 10].includes(rowData.type)) {
          if (rowData.is_chargeback) { 
            innerCircle = (
              <Icon name="credit-card-refund" size={circleSize} color="#38b35a" />
            );
          } else {
            innerCircle = (
              <Icon name="arrow-bottom-left" size={circleSize} color="#38b35a" />
            );
          }
          // IconFA
        } else if ([5, 6].includes(rowData.type)) {
          innerCircle = (
            <IconFA name="coins" size={circleSize} color="#38b35a" />
          );
        } else if ([21].includes(rowData.type)) {
          innerCircle = (
            <IconFA name="hand-holding-usd" size={circleSize} color="#38b35a" />
          );
        } else if ([2, 3, 22, 26, 27, 28].includes(rowData.type)) {
          innerCircle = (
            <Icon name="arrow-top-right" size={circleSize} color="#38b35a" />
          );
        } else if ([40].includes(rowData.type)) {
          innerCircle = (
            <Icon name="qrcode" size={circleSize} color="#38b35a" />
          );
        } else if (rowData.type === 60) {
          innerCircle = (
            <Icon name="barcode" size={circleSize} color="#38b35a" />
          );
        } else if ([4, 7].includes(rowData.type)) {
          innerCircle = (
            <Icon name="lock-open-outline" size={circleSize} color="#38b35a" />
          );
        } else if ([8, 16, 17].includes(rowData.type)) {
          innerCircle = (
            <Icon name="swap-horizontal-variant" size={circleSize} color="#38b35a" />
          );
        } else if ([9, 11, 13, 14, 15, 23, 24].includes(rowData.type)) {
          innerCircle = (
            <Icon name="credit-card" size={circleSize} color="#38b35a" />
          );
        } else if (rowData.type === 19) {
          innerCircle = (
            <Icon name="barcode" size={circleSize} color="#38b35a" />
          );
        } else if (rowData.type === 29) {
          innerCircle = (
            <Icon name="image-outline" size={circleSize} color="#38b35a" />
          );
        } else if (rowData.type === 50) {
          innerCircle = (
            <Icon name="twitter-retweet" size={circleSize} color="#38b35a" />
          );
        } else if ([12, 25].includes(rowData.type)) {
          innerCircle = (
            // <Icon name="repeat" size={circleSize} color="#38b35a" />
            <Icon name="arrow-bottom-left" size={circleSize} color="#38b35a" />
            // <Icon name="swap-horizontal" size={circleSize} color="#0F5F54" />
          );
        } 
        // innerCircle = (
        //   <Image
        //     source={iconSource}
        //     defaultSource={iconDefault}
        //     style={[iconStyle, this.props.iconStyle]}
        //   />
        // );
        break;
      case "dot":
        let dotStyle = {
          height: circleSize / 2,
          width: circleSize / 2,
          borderRadius: circleSize / 4,
          backgroundColor: rowData.dotColor
            ? rowData.dotColor
            : this.props.dotColor
            ? this.props.dotColor
            : defaultDotColor,
        };
        innerCircle = <View style={[styles.dot, dotStyle]} />;
        break;
    }
    return (
      <View style={[styles.circle, circleStyle, this.props.circleStyle]}>
        {innerCircle}
      </View>
    );
  }

  _renderSeparator() {
    if (!this.props.separator) {
      return null;
    }
    return <View style={[styles.separator, this.props.separatorStyle]} />;
  }
}

Timeline.defaultProps = {
  circleSize: defaultCircleSize,
  circleColor: defaultCircleColor,
  lineWidth: defaultLineWidth,
  lineColor: defaultLineColor,
  innerCircle: defaultInnerCircle,
  columnFormat: "single-column-left",
  separator: false,
  showTime: true,
};

const stylesDark = StyleSheet.create({
  date: {
    fontSize: 14,
    color: '#FFF'
  },
  title: {
    fontSize: 14,
    // fontWeight: "bold"
    color: "#fff"
  },
  who: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
    color: "#FFF"
  },
  value: {
    fontSize: 16,
    // fontWeight: "bold"
    color: "#FFF"
  },
  value2: {
    fontSize: 16,
    // fontWeight: "bold"
    color: "#FFF",
    marginTop: 10,
  },
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingBottom: 10,
  },
  listview: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 15,
    backgroundColor: "#007AFF",
    height: 30,
    justifyContent: "center",
  },
  sectionHeaderText: {
    color: "#FFF",
    fontSize: 18,
    alignSelf: "center",
  },
  rowContainer: {
    flexDirection: "row",
    flex: 1,
    //alignItems: 'stretch',
    justifyContent: "center",
  },
  timeContainer: {
    minWidth: 45,
  },
  time: {
    textAlign: "right",
    color: defaultTimeTextColor,
    overflow: "hidden",
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 10,
    zIndex: 1,
    position: "absolute",
    // left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: defaultDotColor,
  },
  load: {
    borderRadius: 50,
  },
  containerTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 10,
  },
  containerTitleLoad: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 10,
  },
  titleLoad: {
    borderRadius: 4,
  },
  dateLoad: {
    borderRadius: 4,
    marginLeft: 5,
  },
  dataLoad: {
    marginTop: 10,
    // marginBottom: 10,
    borderRadius: 4,
  },
  title: {
    fontSize: 14,
    // fontWeight: "bold"
  },
  date: {
    fontSize: 14,
  },
  who: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
  },
  value: {
    fontSize: 16,
    // fontWeight: "bold"
  },
  value2: {
    fontSize: 16,
    marginTop: 10,
    // fontWeight: "bold"
  },
  fee: {
    fontSize: 12,
    fontWeight: "bold",
  },
  details: {
    borderLeftWidth: defaultLineWidth,
    flexDirection: "column",
    flex: 1,
  },
  detail: { paddingTop: 0, paddingBottom: 32 },
  description: {
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#aaa",
    marginTop: 10,
    marginBottom: 10,
  },
});
