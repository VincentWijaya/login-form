import React, { useEffect, useState } from 'react';
import Button from '@/Components/Button';
import Checkbox from '@/Components/Checkbox';
import Guest from '@/Layouts/Guest';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import ValidationErrors from '@/Components/ValidationErrors';
import { Head, Link, useForm } from '@inertiajs/inertia-react';
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: '',
        captcha: '',
    });

    const [blockCounter, setBlockCounter] = useState(0)
    const [blockUntill, setBlock] = useState()

    useEffect(() => {
        const now = new Date()
        const blockTill = localStorage.getItem("blockUntill")
        blockTill >= now ? setBlock(Number(blockTill)) : ''

        loadCaptchaEnginge(6);
        return () => {
            reset('password');
        };
    }, []);

    const onHandleChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const submit = (e) => {
      e.preventDefault();

      if (blockCounter == 2) {
        let now = new Date()
        const blockTill = now.setSeconds(now.getSeconds() + 30)
        localStorage.setItem("blockUntill", blockTill)
        setBlock(blockTill)
        setBlockCounter(0)
      }

      const now = new Date()
      now >= blockUntill ? setBlock(null) : ''

      if (validateCaptcha(data.captcha)==true) {
        post(route('login'));

        setTimeout(() => {
          if (errors) {
            setBlockCounter(blockCounter + 1)
          }
        }, 500);
      } else {
        alert('Captcha Does Not Match')
      }
    };

    return (
        <Guest>
            <Head title="Log in" />

            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

            <ValidationErrors errors={blockUntill ? {blocked: `Please wait untill ${new Date(blockUntill)} to login`} : errors} />

            <form onSubmit={submit}>
                <div>
                    <Label forInput="email" value="Email" />

                    <Input
                        type="text"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        handleChange={onHandleChange}
                    />
                </div>

                <div className="mt-4">
                    <Label forInput="password" value="Password" />

                    <Input
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        handleChange={onHandleChange}
                    />
                </div>

                <div className="mt-4">
                  <LoadCanvasTemplate />
                  <Input
                      type="text"
                      name="captcha"
                      value={data.captcha}
                      className="mt-1 block w-full"
                      isFocused={true}
                      handleChange={onHandleChange}
                  />
                </div>

                <div className="block mt-4">
                    <label className="flex items-center">
                        <Checkbox name="remember" value={data.remember} handleChange={onHandleChange} />

                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                </div>

                <div className="flex items-center justify-end mt-4">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="underline text-sm text-gray-600 hover:text-gray-900"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <Button className="ml-4" processing={processing}>
                        Log in
                    </Button>
                </div>
            </form>
        </Guest>
    );
}
