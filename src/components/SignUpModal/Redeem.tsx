import * as React from "react"
import { Button } from "react-bootstrap"

type StatusType = "error" | null;

interface RedeemProps {
	ethAddress: string;
	planName: string;
}

const planNameToCodeName = ({ planName }: { planName: string }) => {
	switch (planName) {
		case "Basic":
			return "128GB";
		case "Professional":
			return "1TB";
		case "Business":
			return "2TB";
		default:
			return;
	}
};

// TODO: switch to Formik form
const Redeem = ({ ethAddress, planName }: RedeemProps) => {
	const [status, setStatus] = React.useState<JSX.Element>();
	const [statusType, setStatusType] = React.useState<StatusType>();
	const [disabled, setDisabled] = React.useState(false);
	const [buttonText, setButtonText] = React.useState("Redeem Gift Code");

	const [code, setCode] = React.useState("");

	const redeemCode = async ({ code, planName, ethAddress }: {
		code: string,
		ethAddress: string,
		planName: string
	}) => {
		setDisabled(true);
		setStatusType(null);
		setStatus(undefined);
		setButtonText("Checking...");

		const res = await (await fetch(`https://redeem.opacity.io/api?code=OPCT${planNameToCodeName({ planName })}-${code.toUpperCase()}&ethaddress=${ethAddress}`))
			.json()
			.catch((err: Error) => {
				setStatus(<div>{err.message}</div>)
				setStatusType("error")
				setDisabled(false)
			});

		if (!res.data || !res.data.txhash) {
			setStatusType("error");
			setStatus(res.msg);
			setDisabled(false);
			setButtonText("Redeem");
		} else {
			setStatus(<a href={`https://etherscan.io/tx/${res.data.txhash}`} target="_blank">Transaction tracker</a>);
			setButtonText("Sending Payment...");
		}

		return res;
	};

	return (
		planNameToCodeName({ planName })
			? (
				<>
					<div className="d-flex">
						<h4>OPCT{planNameToCodeName({ planName })}</h4>
						<div>
							<input
								className={statusType == "error" ? "redeem-form-error" : ""}
								onChange={(e) => setCode(e.target.value)}
							/>
							{status && <div className={statusType == "error" ? "redeem-form-error" : ""}>{status}</div>}
						</div>
					</div>
					<Button
						className="redeem-button"
						disabled={disabled}
						variant='primary'
						onClick={() => redeemCode({ code, ethAddress, planName })}
					>{buttonText}</Button>
				</>
			)
			: null
	);
};

export default Redeem;