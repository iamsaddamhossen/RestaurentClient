import React, { useState, useEffect } from 'react';
import { createAPIEndpoint, ENDPOINTS } from '../../api';
import Table from '../Layouts/Table';
import { TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

export default function OrderList(props) {

    const { setOrderId, setOrderListVisiblity, resetFormControls, setNotify } = props;

    const [orderList, setOrderList] = useState([]);

    useEffect(() => {
        createAPIEndpoint(ENDPOINTS.ORDER).fetchAll()
            .then(res => {
                console.log(res.data)
                setOrderList(res.data)
            })
            .catch(err => console.log(err))

    }, []);

    const showForUpdate = id => {
        setOrderId(id);
        setOrderListVisiblity(false);
    }

    const deleteOrder = id => {
        if (window.confirm('Are you sure to delete?')) {
            createAPIEndpoint(ENDPOINTS.ORDER).delete(id)
                .then(res => {
                    setOrderListVisiblity(false);
                    setOrderId(0);
                    resetFormControls();
                    setNotify({ isOpen: true, message: 'Order is deleted!' });
                })
                .catch(err => console.log(err))
        }
    }

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Order No</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Payed With</TableCell>
                    <TableCell>Grand Total</TableCell>
                    <TableCell>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    orderList.map(item => (
                        <TableRow key={item.orderMasterId}>

                            <TableCell onClick={e => showForUpdate(item.orderMasterId)}>
                                {item.orderNumber}
                            </TableCell>

                            <TableCell onClick={e => showForUpdate(item.orderMasterId)}>
                                {item.customer.customerName}
                            </TableCell>

                            <TableCell onClick={e => showForUpdate(item.orderMasterId)}>
                                {item.pMethod}
                            </TableCell>

                            <TableCell onClick={e => showForUpdate(item.orderMasterId)}>
                                {item.gTotal}
                            </TableCell>

                            <TableCell>
                                <DeleteOutlineIcon
                                    color="secondary"
                                    onClick={e => deleteOrder(item.orderMasterId)}
                                />
                            </TableCell>


                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    )
}
