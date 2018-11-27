import React from "react"
import {withStyles} from '@material-ui/core/styles';
import {CategoryHeight} from "../consts";
import ButtonBase from "@material-ui/core/es/ButtonBase/ButtonBase";
import Typography from "@material-ui/core/es/Typography/Typography";

const styles = theme => ({
    image: {
        position: 'relative',
        height: CategoryHeight,
        [theme.breakpoints.down('xs')]: {
            width: '100% !important', // Overrides inline-style
            height: 100,
        },
        '&:hover, &$focusVisible': {
            zIndex: 1,
            '& $imageBackdrop': {
                opacity: 0.15,
            },
            '& $imageMarked': {
                opacity: 0,
            },
            '& $imageTitle': {
                border: '4px solid currentColor',
            },
        },
        margin: "auto"
    },
    focusVisible: {},
    imageButton: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.common.white,
    },
    imageSrc: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
    },
    imageBackdrop: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: theme.palette.common.black,
        opacity: 0.4,
        transition: theme.transitions.create('opacity'),
    },
    imageTitle: {
        position: 'relative',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 4}px ${theme.spacing.unit + 6}px`,
    },
    imageMarked: {
        height: 3,
        width: 18,
        backgroundColor: theme.palette.common.white,
        position: 'absolute',
        bottom: -2,
        left: 'calc(50% - 9px)',
        transition: theme.transitions.create('opacity'),
    }
});


class ImageButton extends React.Component {

    render() {
        return (<ButtonBase
            focusRipple
            onClick={this.props.onClick}
            key={this.props.image.title}
            className={this.props.classes.image}
            focusVisibleClassName={this.props.classes.focusVisible}
            style={{
                width: this.props.image.width,
            }}
        >
                                <span
                                    className={this.props.classes.imageSrc}
                                    style={{
                                        backgroundImage: `url(${this.props.image.url})`,
                                    }}
                                />
            <span className={this.props.classes.imageBackdrop}/>
            <span className={this.props.classes.imageButton}>
                                    <Typography
                                        component="span"
                                        variant="subheading"
                                        color="inherit"
                                        className={this.props.classes.imageTitle}
                                    >
                                      {this.props.image.title}
                                        <span className={this.props.classes.imageMarked}/>
                                    </Typography>
                                </span>
        </ButtonBase>)
    }
}

export default withStyles(styles)(ImageButton)