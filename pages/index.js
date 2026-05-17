import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Link from 'next/link';                        // CHANGED: was import { Link } from '../routes'
import Head from 'next/head';                        // CHANGED: was import { Helmet } from 'react-helmet'
import {
	Button,
	Container,
	Grid,
	Header,
	Icon,
	Image,
	Menu,
	Segment,
	Visibility,
} from 'semantic-ui-react';
// CHANGED: removed import '../static/hometest.css'
// CSS files must be imported in pages/_app.js, not inside page components.
// Add this line to pages/_app.js:   import '../static/hometest.css';
// After renaming /static → /public, update to: import '../public/hometest.css'

// CHANGED: removed import { Responsive } from 'semantic-ui-react'
// Responsive was removed in semantic-ui-react v2. Replaced with a plain <div>.

const HomepageHeading = ({ mobile }) => (
	<Container text className="cont">
		<Header
			as="h1"
			content="A blockchain-based E-voting system, built with love."
			inverted
			style={{
				fontSize: mobile ? '2em' : '3em',
				fontWeight: 'normal',
				marginBottom: 0,
				marginTop: mobile ? '1.5em' : '2em',
				color: 'black',
			}}
		/>
		<Header
			as="h4"
			content="Make your vote count!"
			inverted
			style={{
				fontSize: mobile ? '1.5em' : '1.7em',
				fontWeight: 'normal',
				marginTop: mobile ? '0.5em' : '1.5em',
				color: 'grey',
			}}
		/>
		<div style={{ float: 'left', marginTop: '10%' }}>
			<Header as="h4" style={{ color: 'grey' }}>
				Register/ Sign in for the company
			</Header>
			{/* CHANGED: <Link route="./company_login"> → <Link href="/company_login"> */}
			<Link href="/company_login">
				<Button primary size="huge" style={{ color: 'white', backgroundColor: '#627eea' }}>
					<Icon name="left arrow" />
					Company
				</Button>
			</Link>
		</div>

		<div style={{ float: 'right', marginTop: '10%' }}>
			<Header as="h4" style={{ color: 'grey' }}>
				{' '}
				Sign in for Voters!
			</Header>
			{/* CHANGED: <Link route="/voter_login"> → <Link href="/voter_login"> */}
			<Link href="/voter_login">
				<Button primary size="huge" style={{ color: 'white', backgroundColor: '#627eea' }}>
					Voters
					<Icon name="right arrow" />
				</Button>
			</Link>
		</div>
	</Container>
);

HomepageHeading.propTypes = {
	mobile: PropTypes.bool,
};

class DesktopContainer extends Component {
	state = {};

	hideFixedMenu = () => this.setState({ fixed: false });
	showFixedMenu = () => this.setState({ fixed: true });

	render() {
		const { children } = this.props;
		const { fixed } = this.state;

		return (
			// CHANGED: <Responsive> → <div>
			// Responsive was removed from semantic-ui-react v2+.
			<div>
				{/* CHANGED: removed <link rel="stylesheet" href="//cdn..."> — loaded in _app.js */}

				{/* CHANGED: <Helmet><title>...</title></Helmet> → <Head><title>...</title></Head> */}
				<Head>
					<title>HomePage</title>
					<link rel="shortcut icon" type="image/x-icon" href="/public/logo3.png" />
				</Head>

				<Visibility once={false} onBottomPassed={this.showFixedMenu} onBottomPassedReverse={this.hideFixedMenu}>
					<Segment inverted textAlign="center" style={{ minHeight: 700, padding: '1em 0em' }} vertical>
						<Menu
							fixed={fixed ? 'top' : null}
							inverted={!fixed}
							pointing={!fixed}
							secondary={!fixed}
							size="large"
							className="menu"
						>
							<Container>
								<h1
									style={{
										color: '#627eea',
										verticalAlign: 'middle',
										fontFamily: 'Freestyle Script',
										fontSize: '400%',
										paddingLeft: '42%',
									}}
								>
									BlockVotes
								</h1>
							</Container>
						</Menu>
						<HomepageHeading />
					</Segment>
				</Visibility>

				{children}
			</div>
		);
	}
}

DesktopContainer.propTypes = {
	children: PropTypes.node,
};

const ResponsiveContainer = ({ children }) => (
	<div>
		<DesktopContainer>{children}</DesktopContainer>
	</div>
);

ResponsiveContainer.propTypes = {
	children: PropTypes.node,
};

const HomepageLayout = () => (
	<ResponsiveContainer>
		<Segment style={{ padding: '8em 0em' }} vertical>
			<Grid columns="equal" stackable>
				<Grid.Row textAlign="center">
					<Grid.Column style={{ paddingBottom: '5em', paddingTop: '5em' }}>
						<Header as="h3" style={{ fontSize: '2em' }}>
							Private
						</Header>
						<p style={{ fontSize: '1.33em' }}>
							Doesn't give any information <br />
							regarding personal data.
						</p>
						<Header as="h3" style={{ fontSize: '2em' }}>
							Secure
						</Header>
						<p style={{ fontSize: '1.33em' }}>
							Not even a single chance of shutting <br /> down of the system.
						</p>
					</Grid.Column>
					{/* CHANGED: src="../static/ether2.png" → src="/static/ether2.png" */}
					{/* Relative paths break in Next.js — must always use absolute path from root */}
					<Image src="/public/ether2.png" width="216" height="256" style={{ paddingTop: '50px' }} />

					<Grid.Column style={{ paddingBottom: '5em', paddingTop: '5em' }}>
						<Header as="h3" style={{ fontSize: '2em' }}>
							Decentralized
						</Header>
						<p style={{ fontSize: '1.33em' }}>
							Decentralized technology gives you the <br /> power to store your assets in a network.
						</p>
						<Header as="h3" style={{ fontSize: '2em' }}>
							Immutable
						</Header>
						<p style={{ fontSize: '1.33em' }}>
							Keeps its ledgers in a never-ending <br /> state of forwarding momentum.
						</p>
					</Grid.Column>
				</Grid.Row>
			</Grid>
		</Segment>

		<Segment inverted vertical style={{ padding: '5em 0em', backgroundColor: '#627eea' }}>
			<Container>
				<Header as="h3" style={{ fontSize: '2em', color: 'white', textAlign: 'center' }}>
					A fascinating quote
				</Header>
				<p style={{ fontSize: '1.33em', textAlign: 'center', fontStyle: 'Italic' }}>
					"We have elected to put our money and faith in a mathematical framework that is free of politics and
					human error."
				</p>
				<Header as="h2" style={{ fontSize: '1.33em', color: 'white', textAlign: 'center' }}>
					Tyler Winklevoss
				</Header>
			</Container>
		</Segment>
	</ResponsiveContainer>
);

export default HomepageLayout;