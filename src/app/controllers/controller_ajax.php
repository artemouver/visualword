<?php
class Controller_Ajax extends Controller {

    function __construct() {
        $this->model = new Model_Ajax();
        $this->view = new View();
    }

    function action_coefficients() {
        $data = $this->model->get_coefficients();
        $this->view->generate('', 'ajax_view.php', $data);
    }
}
?>