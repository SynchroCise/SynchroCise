
import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import * as requests from './../utils/requests'

const WorkoutHistoryTable = () => {
    const [workoutHistory, setWorkoutHistory] = useState([]);
    useEffect(() => {
        const getWorkoutHistory = async () => {
            let dates = [];
            const res = await requests.getWorkoutHistory();
            if (Array.isArray(res.body)) {
                res.body.forEach((item) => {
                    dates.push(Date(item))
                })
            }
            setWorkoutHistory(dates);
        }
        getWorkoutHistory();
    }, [setWorkoutHistory]);
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