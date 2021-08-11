
import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Table, TableBody, TableCell, TableHead, TableRow, Collapse, IconButton, Typography } from '@material-ui/core';
import * as requests from './../utils/requests'
import { useAppContext } from "../AppContext";
import { useHistory } from 'react-router-dom'

const WorkoutHistoryTable = () => {
    const [workoutHistory, setWorkoutHistory] = useState([]);

    useEffect(() => {
        const getWorkoutHistory = async () => {
            let dates = [];
            const res = await requests.getWorkoutHistory();
            res.body.forEach((item, index) => {
                dates.push(Date(item))
            })
            setWorkoutHistory(dates);
            console.log(workoutHistory)
        }
        getWorkoutHistory();
    }, []);

    return (
        <Table >
            < TableHead >
                <TableRow>
                    <TableCell align="left"><b>Time</b></TableCell>
                </TableRow>
            </TableHead >
            <TableBody>
                {workoutHistory.map((row, index) =>
                    <Row key={index}
                        row={row}
                        index={index} />)
                }
            </TableBody>
        </Table >
    );
}

export const Row = ({ row, index }) => {
    const [open, setOpen] = useState(false);
    // https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
    const useStyles = makeStyles(theme => ({
        tableRow: {
            "&$selected, &$selected:hover": {
                backgroundColor: theme.palette.primary.main
            },
            '& > *': {
                borderBottom: 'unset',
            },
        },
        tableCell: {
            "$selected &": {
                color: theme.palette.primary.contrastText,
            }
        },
        hover: {},
        selected: {}
    }));
    const classes = useStyles();
    return (
        <React.Fragment>
            <TableRow
                key={index}
                classes={{ hover: classes.hover, selected: classes.selected }}
                className={classes.tableRow}>
                <TableCell >{row}</TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default WorkoutHistoryTable;