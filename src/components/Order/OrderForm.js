import React, { useState, useEffect } from 'react';
import Form from "../Layouts/Form";
import { Grid, InputAdornment, makeStyles, ButtonGroup, Button as MuiButton } from "@material-ui/core";
import { Input, Select, Button } from "../Controls";
import ReplayIcon from '@material-ui/icons/Replay';
import ReorderIcon from '@material-ui/icons/Reorder';
import RestaurantMenuIcon from '@material-ui/icons/RestaurantMenu';
import { createAPIEndpoint, ENDPOINTS } from '../../api';
import { roundTo2DecimalPoint } from '../../utils';

import Popup from '../Layouts/Popup';
import OrderList from './OrderList';

import Notification from '../Layouts/Notification'


const pMethods = [
    { id: 'none', title: 'Select' },
    { id: 'Cash', title: 'Cash' },
    { id: 'Card', title: 'Card' },
    //{ id: 'none', title: 'Select' },
]


const useStyles = makeStyles(theme => ({
    adornmentText: {
        '& .MuiTypography-root': {
            color: '#f3b33d',
            fontWeight: 'bolder',
            fontSize: '1.5em'
        }
    },

    submitButtonGroup: {
        backgroundColor: '#f3b33d',
        color: '#000',
        margin: theme.spacing(1),
        '& .MuiButton-label': {
            textTransform: 'none'
        },
        '&:hover': {
            backgroundColor: '#f3b3d3',
        }
    }
}))




export default function OrderForm(props) {


    const { values, setValues, errors, setErrors, handleInputChange, resetFormControls } = props;

    const classes = useStyles();

    const [customerList, setCustomerList] = useState([]);

    const [orderListVisiblity, setOrderListVisiblity] = useState(false);

    const [orderId, setOrderId] = useState(0);

    const [notify, setNotify] = useState({isOpen: false});

    useEffect(() => {
        createAPIEndpoint(ENDPOINTS.CUSTOMER).fetchAll()
            .then(res => {
                let customerList = res.data.map(item => ({
                    id: item.customerId,
                    title: item.customerName
                }));

                customerList = [{ id: 0, title: 'Select' }].concat(customerList);
                setCustomerList(customerList);
            })
            .catch(err => console.log(err))
    }, [])


    useEffect(() => {

        let gTotal = values.orderDetails.reduce((tempTotal, item) => {
            return tempTotal + (item.quantity * item.foodItemPrice);
        }, 0);

        setValues({
            ...values,
            gTotal: roundTo2DecimalPoint(gTotal)
        })

    }, [JSON.stringify(values.orderDetails)]);


    useEffect(() => {
        if (orderId == 0) resetFormControls()
        else {
            createAPIEndpoint(ENDPOINTS.ORDER).fetchById(orderId)
                .then(res => {
                    setValues(res.data);
                    setErrors({});
                })
                .catch(err => console.log(err))
        }
    }, [orderId])


    debugger;
    const validateForm = () => {
        let temp = {};
        temp.customerId = values.customerId != 0 ? "" : "This field is required!";
        temp.pMethod = values.pMethod != "none" ? "" : "This field is required!";
        temp.orderDetails = values.orderDetails.length != 0 ? "" : "This field is required";
        setErrors({ ...temp });
        return Object.values(temp).every(x => x === "");
    }

    const resetForm = () => {
        resetFormControls();
        setOrderId(0);
    }

    const submitOrder = (e) => {
        e.preventDefault();
        //alert("Hello");
        if (validateForm()) {
            if(values.orderMasterId == 0) {
            createAPIEndpoint(ENDPOINTS.ORDER).create(values)
                .then(res => {
                    resetFormControls();
                    setNotify({isOpen: true, message: 'New order is created!'});
                })

                .catch(err => console.log(err));
        } else {
            createAPIEndpoint(ENDPOINTS.ORDER).update(values.orderMasterId, values)
                .then(res => {
                    setOrderId(0);
                    setNotify({isOpen: true, message: 'Order is updated!'})
                })

                .catch(err => console.log(err));
        }
    }
}

    const openListOfOrders = (e) => {
        e.preventDefault();
        setOrderListVisiblity(true);
        //alert('Hello');
    }


    return (
        <>
            <Form onSubmit={submitOrder}>
                <Grid container>
                    <Grid item xs={6}>
                        <Input
                            label="Order Number"
                            name="orderNumber"
                            value={values.orderNumber}
                            InputProps={
                                {
                                    startAdornment: <InputAdornment
                                        className={classes.adornmentText}
                                        position="start">#</InputAdornment>
                                }
                            }
                            disabled />

                        <Select
                            label="Customer"
                            name="customerId"
                            value={values.customerId}
                            onChange={handleInputChange}
                            options={customerList}
                            error={errors.customerId}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Select
                            label="Payment Method"
                            name="pMethod"
                            value={values.pMethod}
                            onChange={handleInputChange}
                            options={pMethods}
                            error={errors.pMethod}
                        />
                        <Input
                            label="Grand Total"
                            name="gTotal"
                            value={values.gTotal}
                            InputProps={
                                {
                                    startAdornment: <InputAdornment
                                        className={classes.adornmentText}
                                        position="start">৳</InputAdornment>
                                }
                            }
                            onChange={handleInputChange}
                            disabled />

                        <ButtonGroup className={classes.submitButtonGroup}>
                            <MuiButton
                                size="large"
                                endIcon={<RestaurantMenuIcon />}
                                type="submit"
                            >Submit</MuiButton>

                            <MuiButton
                                onClick={resetForm}
                                size="small"
                                startIcon={<ReplayIcon />}
                            />
                        </ButtonGroup>

                        <Button
                            size="large"
                            onClick={openListOfOrders}
                            startIcon={<ReorderIcon />}
                        >Orders</Button>
                    </Grid>
                </Grid>
            </Form>

            <Popup
                title="List of Orders"
                openPopup={orderListVisiblity}
                setOpenPopup={setOrderListVisiblity}>
                <OrderList {...{ setOrderId, setOrderListVisiblity, resetFormControls, setNotify }} />
            </Popup>

            <Notification
              {...{notify, setNotify}}
            
            />
                
            
        </>
    )
}
